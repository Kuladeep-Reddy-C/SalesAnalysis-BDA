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
        "bias": float((predicted.astype(float) - actual.astype(float)).mean()),
    }


def mase(actual: pd.Series, predicted: pd.Series, training: pd.Series) -> float:
    """Mean absolute scaled error using a one-step naive training scale."""
    scale = training.astype(float).diff().abs().dropna().mean()
    return float((actual.astype(float) - predicted.astype(float)).abs().mean() / scale) if scale and not math.isnan(scale) else float("nan")


def revenue_weighted_absolute_error(actual: pd.Series, predicted: pd.Series, price: pd.Series) -> float:
    weighted_actual = actual.astype(float) * price.astype(float)
    weighted_error = (actual.astype(float) - predicted.astype(float)).abs() * price.astype(float)
    denominator = float(weighted_actual.abs().sum())
    return float(weighted_error.sum() / denominator) if denominator else float("nan")
