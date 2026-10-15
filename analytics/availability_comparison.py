from __future__ import annotations

import json
import time
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from analytics.metrics import regression_metrics
from analytics.preprocess import add_features, build_daily_dataset, read_inputs
from analytics.pipeline import FEATURES
from config import Config


def run(config: Config | None = None) -> dict:
    config = config or Config()
    started = time.perf_counter()
    sales, prices, calendar = read_inputs(config.sales_path, config.prices_path, config.calendar_path)
    daily, _ = build_daily_dataset(sales, prices, calendar)
    featured = add_features(daily).dropna(subset=FEATURES)
    dates = sorted(featured.date.unique())
    test_start = dates[-config.test_days]
    train = featured[featured.date < test_start]
    test = featured[featured.date >= test_start]
    rows = []
    for policy, train_frame in (("retain_imputed", train), ("available_only", train[train.is_available == 1])):
        model = RandomForestRegressor(n_estimators=40, max_depth=10, min_samples_leaf=3, random_state=config.random_seed, n_jobs=-1)
        model.fit(train_frame[FEATURES], train_frame.sales)
        test_copy = test.copy()
        test_copy["prediction"] = model.predict(test_copy[FEATURES]).clip(min=0)
        rows.append({"policy": policy, "train_rows": len(train_frame), "test_rows": len(test_copy), **regression_metrics(test_copy.sales, test_copy.prediction)})
    output = pd.DataFrame(rows)
    output.to_csv(config.results / "metrics" / "availability_model_comparison.csv", index=False)
    summary = {"runtime_seconds": time.perf_counter() - started, "unmatched_price_rows": int((daily.is_available == 0).sum()), "comparison": rows}
    (config.results / "metrics" / "availability_comparison_summary.json").write_text(json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    print(run())
