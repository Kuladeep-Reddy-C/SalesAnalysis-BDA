from __future__ import annotations

import argparse
import json
import shutil
import time
from pathlib import Path

import pandas as pd

from config import Config


def replay(config: Config | None = None, output: Path | None = None, days: int = 28, interval_seconds: float = 0.0) -> dict:
    """Write historical rows as day-sized JSON micro-batches.

    This is a simulated stream: every record is historical and is labelled as such.
    """
    config = config or Config()
    output = output or config.root / "stream_input"
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    sales = pd.read_csv(config.sales_path, usecols=["item_id", "store_id", "d", "sales"])
    calendar = pd.read_csv(config.calendar_path, usecols=["d", "date"])
    sales = sales.merge(calendar, on="d", validate="many_to_one")
    sales["date"] = pd.to_datetime(sales["date"])
    selected_dates = sorted(sales["date"].unique())[-days:]
    rows = 0
    for index, date in enumerate(selected_dates):
        batch = sales[sales["date"] == date].copy()
        batch["date"] = batch["date"].dt.strftime("%Y-%m-%d")
        batch["stream_type"] = "simulated_historical_replay"
        batch.to_json(output / f"batch-{index:04d}.json", orient="records", lines=True)
        rows += len(batch)
        if interval_seconds > 0 and index < len(selected_dates) - 1:
            time.sleep(interval_seconds)
    return {"stream_type": "simulated_historical_replay", "batch_count": len(selected_dates), "rows": rows, "output": str(output), "interval_seconds": interval_seconds}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Replay historical sales as simulated stream batches")
    parser.add_argument("--days", type=int, default=28)
    parser.add_argument("--interval", type=float, default=0.0, help="Seconds between simulated day batches")
    args = parser.parse_args()
    print(json.dumps(replay(days=args.days, interval_seconds=args.interval), indent=2))
