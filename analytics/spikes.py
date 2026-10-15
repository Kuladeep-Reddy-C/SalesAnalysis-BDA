from __future__ import annotations

import pandas as pd
from scipy.stats import poisson


def detect_spikes(daily: pd.DataFrame, window: int = 28, min_expected: float = 1.0, tail_threshold: float = 0.01) -> pd.DataFrame:
    """Detect unusually high counts using a one-sided Poisson tail probability."""
    result = daily.sort_values(["item_id", "store_id", "date"]).copy()
    group = result.groupby(["item_id", "store_id"], sort=False)["sales"]
    result["expected_sales"] = group.transform(lambda values: values.shift(1).rolling(window, min_periods=window).mean())
    result["historical_std"] = group.transform(lambda values: values.shift(1).rolling(window, min_periods=window).std())
    rate = result["expected_sales"].clip(lower=min_expected)
    result["spike_score"] = poisson.sf(result["sales"].astype(float) - 1, rate)
    result["is_spike"] = ((result["expected_sales"] >= min_expected) & (result["spike_score"] <= tail_threshold) & (result["sales"] > result["expected_sales"])).fillna(False)
    result["reason"] = result["is_spike"].map({True: "Poisson tail probability <= 0.01 above trailing demand rate", False: "Not flagged"})
    return result


def validate_injected_spikes(daily: pd.DataFrame, multiplier: float = 5.0) -> pd.DataFrame:
    """Inject synthetic spikes and report detector precision and recall."""
    baseline = daily.copy()
    candidates = baseline.groupby(["item_id", "store_id"], sort=False).tail(1).index
    injected = baseline.copy()
    injected["known_spike"] = False
    injected.loc[candidates, "sales"] = injected.loc[candidates, "sales"] * multiplier + 1
    injected.loc[candidates, "known_spike"] = True
    detected = detect_spikes(injected)
    true_positive = int((detected["known_spike"] & detected["is_spike"]).sum())
    false_positive = int((~detected["known_spike"] & detected["is_spike"]).sum())
    false_negative = int((detected["known_spike"] & ~detected["is_spike"]).sum())
    return pd.DataFrame([{"multiplier": multiplier, "injected": len(candidates), "true_positive": true_positive, "false_positive": false_positive, "false_negative": false_negative, "precision": true_positive / (true_positive + false_positive) if true_positive + false_positive else 0.0, "recall": true_positive / (true_positive + false_negative) if true_positive + false_negative else 0.0}])
