from __future__ import annotations

import json
import platform
import time
from pathlib import Path

import pandas as pd

from analytics.preprocess import add_features, build_daily_dataset, read_inputs
from config import Config


def run(config: Config | None = None, repeats: int = 2) -> pd.DataFrame:
    config = config or Config()
    sales, prices, calendar = read_inputs(config.sales_path, config.prices_path, config.calendar_path)
    rows = []
    for fraction in (0.10, 0.50, 1.00):
        sample = sales.sample(frac=fraction, random_state=42)
        for repeat in range(repeats):
            started = time.perf_counter()
            daily, joins = build_daily_dataset(sample, prices, calendar)
            featured = add_features(daily)
            rows.append({"engine": "pandas_reference", "fraction": fraction, "repeat": repeat + 1, "input_rows": len(sample), "output_rows": len(featured), "seconds": time.perf_counter() - started, "cpu": platform.processor(), "python": platform.python_version()})
    result = pd.DataFrame(rows)
    result.to_csv(config.results / "metrics" / "performance.csv", index=False)
    (config.results / "metrics" / "performance_environment.json").write_text(json.dumps({"platform": platform.platform(), "cpu": platform.processor(), "python": platform.python_version()}, indent=2))
    return result


if __name__ == "__main__":
    print(run().to_string(index=False))
