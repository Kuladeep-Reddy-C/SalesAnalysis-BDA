from __future__ import annotations

import json
from pathlib import Path
import numpy as np
import pandas as pd

from analytics.metrics import regression_metrics
from config import Config


def run(config: Config | None = None, bootstrap_repeats: int = 500) -> dict:
    config = config or Config()
    path = config.results / "predictions" / "rolling_origin_predictions.csv"
    if not path.exists():
        raise FileNotFoundError("Run --rolling-backtest before --model-evidence")
    predictions = pd.read_csv(path, parse_dates=["date", "origin"])
    weekly = predictions.groupby(["origin", "item_id", "store_id"], as_index=False).agg(
        actual_7=("actual", "sum"),
        random_forest_7=("random_forest_prediction", "sum"),
        moving_average_7=("moving_average_prediction", "sum"),
        seasonal_naive_7=("seasonal_naive_prediction", "sum"),
    )
    model_rows = []
    for name, column in (("random_forest", "random_forest_7"), ("moving_average_28", "moving_average_7"), ("seasonal_naive_7", "seasonal_naive_7")):
        model_rows.append({"target": "seven_day_total", "model": name, **regression_metrics(weekly.actual_7, weekly[column]), "rows": len(weekly)})
    rng = np.random.default_rng(config.random_seed)
    item_errors = weekly.assign(
        rf_abs=(weekly.actual_7 - weekly.random_forest_7).abs(),
        ma_abs=(weekly.actual_7 - weekly.moving_average_7).abs(),
    ).groupby("item_id").agg(rf_abs=("rf_abs", "mean"), ma_abs=("ma_abs", "mean"))
    differences = (item_errors["rf_abs"] - item_errors["ma_abs"]).to_numpy()
    samples = rng.choice(differences, size=(bootstrap_repeats, len(differences)), replace=True).mean(axis=1)
    ci_low, ci_high = np.quantile(samples, [0.025, 0.975])
    poisson_rate = np.maximum(weekly.moving_average_7.to_numpy(), 0.1)
    noise_wapes = []
    for _ in range(bootstrap_repeats):
        simulated = rng.poisson(poisson_rate)
        noise_wapes.append(float(np.abs(simulated - weekly.actual_7.to_numpy()).sum() / np.abs(weekly.actual_7.to_numpy()).sum()))
    evidence = pd.DataFrame(model_rows)
    evidence.to_csv(config.results / "metrics" / "weekly_total_metrics.csv", index=False)
    summary = {
        "bootstrap_repeats": bootstrap_repeats,
        "rf_minus_mae_item_bootstrap_ci_low": float(ci_low),
        "rf_minus_mae_item_bootstrap_ci_high": float(ci_high),
        "rf_better_than_ma28_at_item_level": bool(ci_high < 0),
        "poisson_noise_floor_wape_median": float(np.median(noise_wapes)),
        "poisson_noise_floor_wape_ci_low": float(np.quantile(noise_wapes, 0.025)),
        "poisson_noise_floor_wape_ci_high": float(np.quantile(noise_wapes, 0.975)),
        "weekly_rows": len(weekly),
    }
    (config.results / "metrics" / "model_evidence.json").write_text(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
