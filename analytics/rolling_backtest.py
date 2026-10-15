from __future__ import annotations

import time
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from analytics.metrics import regression_metrics
from analytics.preprocess import add_features, build_daily_dataset, read_inputs
from config import Config
from analytics.pipeline import FEATURES


def _future_features(history: list[float], row: pd.Series) -> pd.DataFrame:
    values = history
    return pd.DataFrame([{
        "lag_1": values[-1],
        "lag_7": values[-7],
        "lag_28": values[-28],
        "rolling_7": sum(values[-7:]) / 7,
        "rolling_28": sum(values[-28:]) / 28,
        "sell_price": float(row["sell_price"]),
        "day_of_week": row["date"].dayofweek,
        "month_num": row["date"].month,
        "is_event": int(row["is_event"]),
    }], columns=FEATURES)


def _forecast_origin(model, history_frame: pd.DataFrame, future_frame: pd.DataFrame) -> pd.DataFrame:
    predictions = []
    grouped_history = {(item, store): group.sort_values("date")["sales"].tolist() for (item, store), group in history_frame.groupby(["item_id", "store_id"], sort=False)}
    for (item, store), future_group in future_frame.groupby(["item_id", "store_id"], sort=False):
        history = grouped_history.get((item, store), []).copy()
        if len(history) < 28:
            continue
        for _, row in future_group.sort_values("date").iterrows():
            prediction = max(0.0, float(model.predict(_future_features(history, row))[0]))
            predictions.append({"item_id": item, "store_id": store, "date": row["date"], "horizon": int(row["horizon"]), "actual": float(row["sales"]), "random_forest_prediction": prediction, "moving_average_prediction": sum(history[-28:]) / 28, "seasonal_naive_prediction": history[-7]})
            history.append(prediction)
    return pd.DataFrame(predictions)


def run(config: Config | None = None, origins: int = 4) -> dict:
    config = config or Config()
    config.prepare()
    started = time.perf_counter()
    sales, prices, calendar = read_inputs(config.sales_path, config.prices_path, config.calendar_path)
    daily, _ = build_daily_dataset(sales, prices, calendar)
    featured = add_features(daily).dropna(subset=FEATURES)
    test_start = featured["date"].max() - pd.Timedelta(days=config.test_days - 1)
    available_origins = [test_start - pd.Timedelta(days=1) + pd.Timedelta(days=7 * index) for index in range(origins)]
    all_predictions = []
    for origin in available_origins:
        future = daily[(daily["date"] > origin) & (daily["date"] <= origin + pd.Timedelta(days=7))].copy()
        if future.empty:
            continue
        future["horizon"] = (future["date"] - origin).dt.days
        history = daily[daily["date"] <= origin]
        train = featured[featured["date"] <= origin]
        model = RandomForestRegressor(n_estimators=40, max_depth=10, min_samples_leaf=3, random_state=config.random_seed, n_jobs=-1)
        model.fit(train[FEATURES], train["sales"])
        result = _forecast_origin(model, history, future)
        result["origin"] = origin
        all_predictions.append(result)
    predictions = pd.concat(all_predictions, ignore_index=True)
    rows = []
    for horizon in sorted(predictions["horizon"].unique()):
        horizon_frame = predictions[predictions["horizon"] == horizon]
        for model_name, column in (("random_forest", "random_forest_prediction"), ("moving_average_28", "moving_average_prediction"), ("seasonal_naive_7", "seasonal_naive_prediction")):
            rows.append({"model": model_name, "horizon": int(horizon), **regression_metrics(horizon_frame["actual"], horizon_frame[column]), "rows": len(horizon_frame)})
    metrics = pd.DataFrame(rows)
    predictions.to_csv(config.results / "predictions" / "rolling_origin_predictions.csv", index=False)
    metrics.to_csv(config.results / "metrics" / "horizon_metrics.csv", index=False)
    return {"origins": len(available_origins), "origin_dates": [str(value.date()) for value in available_origins], "prediction_rows": len(predictions), "runtime_seconds": time.perf_counter() - started}


if __name__ == "__main__":
    print(run())
