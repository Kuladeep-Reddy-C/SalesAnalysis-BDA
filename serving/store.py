from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

from config import Config


def build_store(config: Config | None = None, database: Path | None = None) -> Path:
    config = config or Config()
    database = database or config.results / "serving.sqlite3"
    database.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database)
    try:
        forecast = config.results / "predictions" / "seven_day_forecast.csv"
        spikes = config.results / "predictions" / "demand_spikes.csv"
        metrics = config.results / "metrics" / "model_metrics.csv"
        for path, table in ((forecast, "forecasts"), (spikes, "spikes"), (metrics, "metrics")):
            if path.exists():
                import pandas as pd
                pd.read_csv(path).to_sql(table, connection, if_exists="replace", index=False)
        connection.commit()
    finally:
        connection.close()
    return database


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build the local SQLite serving store")
    parser.add_argument("--database", type=Path)
    args = parser.parse_args()
    print(build_store(database=args.database))
