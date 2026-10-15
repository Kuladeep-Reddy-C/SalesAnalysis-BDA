from __future__ import annotations

import argparse
from pathlib import Path
import pandas as pd
import happybase

from config import Config


def table_puts(connection, table_name: str, frame: pd.DataFrame, key_columns: list[str]) -> int:
    if table_name.encode() not in connection.tables():
        connection.create_table(table_name, {"f": {}})
    table = connection.table(table_name)
    count = 0
    with table.batch(batch_size=500) as batch:
        for _, row in frame.iterrows():
            key = "#".join(str(row[column]) for column in key_columns).encode()
            values = {f"f:{column}".encode(): str(row[column]).encode() for column in frame.columns if column not in key_columns and pd.notna(row[column])}
            batch.put(key, values)
            count += 1
    return count


def load(config: Config | None = None, host: str = "127.0.0.1", port: int = 9090) -> dict:
    config = config or Config()
    connection = happybase.Connection(host=host, port=port, timeout=5000)
    connection.open()
    try:
        sources = [
            ("retail_forecasts", config.results / "predictions" / "seven_day_forecast.csv", ["item_id", "store_id", "forecast_date"]),
            ("retail_spikes", config.results / "predictions" / "demand_spikes.csv", ["item_id", "store_id", "date"]),
            ("retail_decisions", config.results / "metrics" / "forecast_uplift_decision.csv", ["item_id", "store_id"]),
            ("retail_metrics", config.results / "metrics" / "model_metrics.csv", ["model"]),
        ]
        loaded = {}
        for table, path, keys in sources:
            if path.exists():
                loaded[table] = table_puts(connection, table, pd.read_csv(path), keys)
        return loaded
    finally:
        connection.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load Review3 outputs into HBase serving tables")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=9090)
    args = parser.parse_args()
    print(load(host=args.host, port=args.port))
