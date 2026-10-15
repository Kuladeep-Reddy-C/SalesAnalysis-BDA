from __future__ import annotations

import math
import pandas as pd


def regression_metrics(actual: pd.Series, predicted: pd.Series) -> dict[str, float]:
    errors = actual.astype(float) - predicted.astype(float)
    absolute = errors.abs()
    denominator = float(actual.astype(float).abs().sum())
    return {
        "mae": float(absolute.mean()),
        "rmse": float(math.sqrt((errors.pow(2)).mean())),
        "wape": float(absolute.sum() / denominator) if denominator else float("nan"),
    }
