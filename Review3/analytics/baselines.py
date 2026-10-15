from __future__ import annotations

import pandas as pd


def add_baseline_predictions(train: pd.DataFrame, test: pd.DataFrame) -> pd.DataFrame:
    """Add transparent baselines fitted only on the chronological training set."""
    result = test.copy()
    group_keys = ["item_id", "store_id"]
    global_mean = float(train["sales"].mean())
    item_mean = train.groupby(group_keys)["sales"].mean()
    result["zero_prediction"] = 0.0
    result["global_mean_prediction"] = global_mean
    result["item_mean_prediction"] = [float(item_mean.get(key, global_mean)) for key in zip(result.item_id, result.store_id)]
    result["last_value_prediction"] = result["lag_1"]
    result["seasonal_naive_prediction"] = result["lag_7"]
    result["baseline_prediction"] = result["seasonal_naive_prediction"]
    result["moving_average_28_prediction"] = result["rolling_28"]
    return result


def add_croston_prediction(train: pd.DataFrame, test: pd.DataFrame, alpha: float = 0.1) -> pd.DataFrame:
    """Add a simple SBA Croston forecast per product-store series."""
    result = test.copy()
    forecasts = {}
    for key, group in train.groupby(["item_id", "store_id"], sort=False):
        demand = group.sort_values("date")["sales"].tolist()
        nonzero = [(index, value) for index, value in enumerate(demand, start=1) if value > 0]
        if not nonzero:
            forecasts[key] = 0.0
            continue
        level = float(nonzero[0][1])
        interval = float(nonzero[0][0])
        previous = nonzero[0][0]
        for index, value in nonzero[1:]:
            level = alpha * value + (1 - alpha) * level
            interval = alpha * (index - previous) + (1 - alpha) * interval
            previous = index
        forecasts[key] = max(0.0, (1 - alpha / 2) * level / interval)
    result["croston_sba_prediction"] = [forecasts.get((item, store), 0.0) for item, store in zip(result.item_id, result.store_id)]
    return result
