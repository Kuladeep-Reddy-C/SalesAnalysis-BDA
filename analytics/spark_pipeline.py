from __future__ import annotations

import json
import time
from pathlib import Path

from config import Config
from analytics.spark_support import create_spark_session

FEATURES = [
    "lag_1", "lag_7", "lag_28", "rolling_7", "rolling_28",
    "sell_price", "day_of_week", "month_num", "is_event",
]


def _metric_row(frame, name: str, prediction_column: str) -> dict:
    from pyspark.sql import functions as F

    values = frame.select(
        F.lit(name).alias("model"),
        F.avg(F.abs(F.col("sales") - F.col(prediction_column))).alias("mae"),
        F.sqrt(F.avg(F.pow(F.col("sales") - F.col(prediction_column), 2))).alias("rmse"),
        (F.sum(F.abs(F.col("sales") - F.col(prediction_column))) / F.sum(F.abs("sales"))).alias("wape"),
        F.count("sales").alias("test_rows"),
    ).first()
    return {key: values[key] for key in values.asDict()}


def run(config: Config | None = None) -> dict:
    """Run the verified batch path with Spark DataFrames and Spark MLlib."""
    from pyspark.ml import Pipeline
    from pyspark.ml.feature import VectorAssembler
    from pyspark.ml.regression import GBTRegressor, RandomForestRegressor
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window

    config = config or Config()
    config.prepare()
    started = time.perf_counter()
    spark = create_spark_session("RetailDemandLabSpark")
    spark.sparkContext.setLogLevel("WARN")
    try:
        sales = spark.read.option("header", True).option("inferSchema", True).csv(str(config.sales_path))
        prices = spark.read.option("header", True).option("inferSchema", True).csv(str(config.prices_path))
        calendar = spark.read.option("header", True).option("inferSchema", True).csv(str(config.calendar_path))
        sales = sales.withColumn("sales", F.col("sales").cast("double"))
        prices = prices.withColumn("wm_yr_wk", F.col("wm_yr_wk").cast("long")).withColumn("sell_price", F.col("sell_price").cast("double"))
        calendar = calendar.withColumn("wm_yr_wk", F.col("wm_yr_wk").cast("long")).withColumn("date", F.to_date("date"))

        calendar_keys = calendar.select("d", "date", "wm_yr_wk", "weekday", "month", "year", "event_name_1", "event_name_2")
        daily = sales.join(calendar_keys, "d", "left")
        unmatched_calendar = daily.filter(F.col("date").isNull()).count()
        price_keys = prices.select("store_id", "item_id", "wm_yr_wk", "sell_price")
        daily = daily.join(price_keys, ["store_id", "item_id", "wm_yr_wk"], "left")
        unmatched_prices = daily.filter(F.col("sell_price").isNull()).count()
        global_price = prices.select(F.percentile_approx("sell_price", 0.5).alias("median")).first()["median"]
        daily = daily.withColumn("sell_price", F.coalesce("sell_price", F.lit(float(global_price or 0.0))))
        daily = daily.withColumn("is_event", ((F.coalesce("event_name_1", F.lit("None")) != "None") | (F.coalesce("event_name_2", F.lit("None")) != "None")).cast("int"))
        daily = daily.withColumn("day_of_week", F.dayofweek("date") - 1).withColumn("month_num", F.month("date"))

        partition = Window.partitionBy("item_id", "store_id").orderBy("date")
        history = partition.rowsBetween(-7, -1)
        long_history = partition.rowsBetween(-28, -1)
        featured = (daily
            .withColumn("lag_1", F.lag("sales", 1).over(partition))
            .withColumn("lag_7", F.lag("sales", 7).over(partition))
            .withColumn("lag_28", F.lag("sales", 28).over(partition))
            .withColumn("rolling_7", F.avg("sales").over(history))
            .withColumn("rolling_28", F.avg("sales").over(long_history))
            .dropna(subset=FEATURES))

        dates = featured.select("date").distinct().orderBy("date")
        date_values = [row["date"] for row in dates.collect()]
        if len(date_values) < config.test_days + config.validation_days:
            raise ValueError("Not enough distinct dates for the configured chronological split")
        test_start = date_values[-config.test_days]
        validation_start = date_values[-(config.test_days + config.validation_days)]
        train = featured.filter(F.col("date") < F.lit(validation_start))
        test = featured.filter(F.col("date") >= F.lit(test_start))

        assembler = VectorAssembler(inputCols=FEATURES, outputCol="features")
        estimator = RandomForestRegressor(featuresCol="features", labelCol="sales", predictionCol="rf_prediction", numTrees=24, maxDepth=8, minInstancesPerNode=5, seed=config.random_seed)
        model = Pipeline(stages=[assembler, estimator]).fit(train)
        predictions = model.transform(test).withColumn("rf_prediction", F.greatest(F.lit(0.0), F.col("rf_prediction"))).withColumn("baseline_prediction", F.col("lag_7"))
        gbt_estimator = GBTRegressor(featuresCol="features", labelCol="sales", predictionCol="gbt_prediction", maxIter=10, maxDepth=3, maxBins=32, seed=config.random_seed)
        gbt_model = Pipeline(stages=[assembler, gbt_estimator]).fit(train)
        predictions = gbt_model.transform(predictions).withColumn("gbt_prediction", F.greatest(F.lit(0.0), F.col("gbt_prediction")))
        metrics = [_metric_row(predictions, "historical_baseline", "baseline_prediction"), _metric_row(predictions, "random_forest_spark", "rf_prediction"), _metric_row(predictions, "gbt_spark", "gbt_prediction")]
        metrics_path = config.results / "metrics" / "spark_model_metrics.csv"
        import pandas as pd
        pd.DataFrame(metrics).to_csv(metrics_path, index=False)
        predictions.select("date", "item_id", "store_id", "sales", "baseline_prediction", "rf_prediction", "gbt_prediction").toPandas().to_csv(config.results / "predictions" / "spark_test_predictions.csv", index=False)
        model_path = config.models / "spark_random_forest"
        model.write().overwrite().save(str(model_path))
        summary = {
            "engine": "pyspark",
            "spark_version": spark.version,
            "master": spark.sparkContext.master,
            "shuffle_partitions": spark.conf.get("spark.sql.shuffle.partitions"),
            "sales_rows": sales.count(), "price_rows": prices.count(), "calendar_rows": calendar.count(),
            "daily_rows": daily.count(), "feature_rows": featured.count(), "train_rows": train.count(), "test_rows": test.count(),
            "unmatched_calendar": unmatched_calendar, "unmatched_prices": unmatched_prices,
            "preprocessing_and_training_seconds": time.perf_counter() - started,
            "test_date_start": str(test_start), "test_date_end": str(date_values[-1]),
        }
        (config.results / "metrics" / "spark_run_summary.json").write_text(json.dumps(summary, indent=2))
        return summary
    finally:
        spark.stop()
