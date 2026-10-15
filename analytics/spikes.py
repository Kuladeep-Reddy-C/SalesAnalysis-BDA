from __future__ import annotations

import pandas as pd


def detect_spikes(daily: pd.DataFrame, window: int = 28, z_threshold: float = 3.0) -> pd.DataFrame:
    result = daily.sort_values(["item_id", "store_id", "date"]).copy()
    group = result.groupby(["item_id", "store_id"], sort=False)["sales"]
    result["expected_sales"] = group.transform(lambda values: values.shift(1).rolling(window, min_periods=window).mean())
    result["historical_std"] = group.transform(lambda values: values.shift(1).rolling(window, min_periods=window).std())
    result["spike_score"] = (result["sales"] - result["expected_sales"]) / result["historical_std"].replace(0, pd.NA)
    result["is_spike"] = (result["spike_score"] >= z_threshold).fillna(False)
    result["reason"] = result["is_spike"].map({True: "Demand exceeded the trailing historical mean by at least 3 standard deviations", False: "Not flagged"})
    return result
