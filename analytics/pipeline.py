from __future__ import annotations

import json
import pickle
import time
from pathlib import Path
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from config import Config
from analytics.metrics import regression_metrics
from analytics.preprocess import add_features, build_daily_dataset, quality_report, read_inputs
from analytics.spark_support import spark_available
from analytics.spikes import detect_spikes

FEATURES = ["lag_1", "lag_7", "lag_28", "rolling_7", "rolling_28", "sell_price", "day_of_week", "month_num", "is_event"]


def run(config: Config | None = None) -> dict:
    config = config or Config()
    config.prepare()
    started = time.perf_counter()
    sales, prices, calendar = read_inputs(config.sales_path, config.prices_path, config.calendar_path)
    quality = quality_report(sales, prices, calendar)
    daily, joins = build_daily_dataset(sales, prices, calendar)
    featured = add_features(daily)
    usable = featured.dropna(subset=FEATURES).copy()
    dates = sorted(usable["date"].unique())
    test_start = dates[-config.test_days]
    validation_start = dates[-(config.test_days + config.validation_days)]
    train = usable[usable["date"] < validation_start]
    validation = usable[(usable["date"] >= validation_start) & (usable["date"] < test_start)]
    test = usable[usable["date"] >= test_start]
    model_started = time.perf_counter()
    model = RandomForestRegressor(n_estimators=80, max_depth=14, min_samples_leaf=2, random_state=config.random_seed, n_jobs=-1)
    model.fit(train[FEATURES], train["sales"])
    training_seconds = time.perf_counter() - model_started
    prediction_started = time.perf_counter()
    test = test.copy()
    test["baseline_prediction"] = test["lag_7"]
    test["rf_prediction"] = model.predict(test[FEATURES]).clip(min=0)
    prediction_seconds = time.perf_counter() - prediction_started
    metric_rows = []
    for name, column in (("historical_baseline", "baseline_prediction"), ("random_forest", "rf_prediction")):
        metric_rows.append({"model": name, **regression_metrics(test["sales"], test[column]), "train_rows": len(train), "validation_rows": len(validation), "test_rows": len(test)})
    metrics = pd.DataFrame(metric_rows)
    test[["date", "item_id", "store_id", "sales", "baseline_prediction", "rf_prediction"]].to_csv(config.results / "predictions" / "test_predictions.csv", index=False)
    quality.to_csv(config.results / "metrics" / "data_quality.csv", index=False)
    metrics.to_csv(config.results / "metrics" / "model_metrics.csv", index=False)
    with (config.models / "random_forest.pkl").open("wb") as handle:
        pickle.dump({"model": model, "features": FEATURES}, handle)
    spikes = detect_spikes(daily)
    spikes[spikes["is_spike"]].to_csv(config.results / "predictions" / "demand_spikes.csv", index=False)
    forecast = recursive_forecast(model, daily, calendar, config.test_days if config.test_days < 7 else 7)
    forecast.to_csv(config.results / "predictions" / "seven_day_forecast.csv", index=False)
    summary = {"execution_mode": "pyspark_available_but_pandas_pipeline_used" if spark_available() else "pandas_fallback_spark_unavailable", "sales_rows": len(sales), "price_rows": len(prices), "calendar_rows": len(calendar), "daily_rows": len(daily), "feature_rows": len(usable), "joins": joins, "training_seconds": training_seconds, "prediction_seconds": prediction_seconds, "preprocessing_seconds": time.perf_counter() - started - training_seconds - prediction_seconds, "train_date_start": str(train["date"].min().date()), "train_date_end": str(train["date"].max().date()), "validation_date_start": str(validation["date"].min().date()), "validation_date_end": str(validation["date"].max().date()), "test_date_start": str(test["date"].min().date()), "test_date_end": str(test["date"].max().date())}
    (config.results / "metrics" / "run_summary.json").write_text(json.dumps(summary, indent=2))
    daily.to_csv(config.results / "daily_dataset.csv", index=False)
    return summary


def recursive_forecast(model, daily: pd.DataFrame, calendar: pd.DataFrame, horizon: int) -> pd.DataFrame:
    """Forecast future calendar dates without using unavailable future actual sales."""
    last_date = daily["date"].max()
    future_calendar = calendar[calendar["date"] > last_date].sort_values("date").head(horizon).copy()
    if future_calendar.empty:
        return pd.DataFrame(columns=["forecast_date", "item_id", "store_id", "predicted_sales", "forecast_generated_at"])
    history = daily[["item_id", "store_id", "date", "sales", "sell_price"]].copy()
    latest_price = history.sort_values("date").groupby(["item_id", "store_id"])["sell_price"].last()
    rows = []
    generated_at = pd.Timestamp.utcnow().isoformat()
    for _, day in future_calendar.iterrows():
        for (item_id, store_id), group in history.groupby(["item_id", "store_id"], sort=False):
            values = group.sort_values("date")["sales"].tolist()
            if len(values) < 28:
                continue
            price = float(latest_price.loc[(item_id, store_id)])
            features = pd.DataFrame([{
                "lag_1": values[-1], "lag_7": values[-7], "lag_28": values[-28],
                "rolling_7": sum(values[-7:]) / 7, "rolling_28": sum(values[-28:]) / 28,
                "sell_price": price, "day_of_week": day["date"].dayofweek,
                "month_num": day["date"].month, "is_event": int(day.get("event_name_1", "None") != "None" or day.get("event_name_2", "None") != "None"),
            }], columns=FEATURES)
            prediction = max(0.0, float(model.predict(features)[0]))
            rows.append({"forecast_date": day["date"], "item_id": item_id, "store_id": store_id, "predicted_sales": prediction, "forecast_generated_at": generated_at})
            history = pd.concat([history, pd.DataFrame([{"item_id": item_id, "store_id": store_id, "date": day["date"], "sales": prediction, "sell_price": price}])], ignore_index=True)
    return pd.DataFrame(rows)


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
