from __future__ import annotations


def add_spark_features(frame):
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window

    partition = Window.partitionBy("item_id", "store_id").orderBy("date")
    return (frame
        .withColumn("lag_1", F.lag("sales", 1).over(partition))
        .withColumn("lag_7", F.lag("sales", 7).over(partition))
        .withColumn("lag_28", F.lag("sales", 28).over(partition))
        .withColumn("rolling_7", F.avg("sales").over(partition.rowsBetween(-7, -1)))
        .withColumn("rolling_28", F.avg("sales").over(partition.rowsBetween(-28, -1)))
        .withColumn("day_of_week", F.dayofweek("date") - 1)
        .withColumn("month_num", F.month("date")))
