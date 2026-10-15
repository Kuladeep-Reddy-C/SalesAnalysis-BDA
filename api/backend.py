from __future__ import annotations

import os
from pathlib import Path
import sqlite3
import pandas as pd

from api.hbase_store import HBaseServingStore


class ServingBackend:
    def __init__(self, results: Path) -> None:
        self.results = results
        self.hbase = HBaseServingStore()
        self.sqlite_path = results / "serving.sqlite3"
        self.preferred = os.getenv("SERVING_BACKEND", "hbase").lower()
        if self.preferred in {"hbase", "auto"}:
            self.hbase.connect()

    def status(self) -> dict:
        return {
            "preferred_backend": self.preferred,
            "active_backend": "hbase" if self.hbase.status.connected else ("sqlite" if self.preferred == "sqlite" else "unavailable"),
            "hbase": self.hbase.status.__dict__,
            "sqlite_available": self.sqlite_path.exists(),
        }

    def _sqlite(self, table: str) -> pd.DataFrame:
        if not self.sqlite_path.exists():
            raise FileNotFoundError(f"SQLite serving store not found: {self.sqlite_path}")
        with sqlite3.connect(self.sqlite_path) as connection:
            return pd.read_sql_query(f"SELECT * FROM {table}", connection)

    def metrics(self) -> list[dict]:
        if self.hbase.status.connected:
            return self.hbase.scan_table(self.hbase.metrics_table)
        if self.preferred == "hbase":
            raise RuntimeError(self.hbase.status.detail)
        return self._sqlite("metrics").to_dict(orient="records")

    def forecasts(self, item_id: str, store_id: str | None = None) -> list[dict]:
        if self.hbase.status.connected:
            return self.hbase.get_forecast(item_id, store_id)
        if self.preferred == "hbase":
            raise RuntimeError(self.hbase.status.detail)
        frame = self._sqlite("forecasts")
        frame = frame[frame["item_id"] == item_id]
        if store_id:
            frame = frame[frame["store_id"] == store_id]
        return frame.to_dict(orient="records")

    def spikes(self, limit: int) -> list[dict]:
        if self.hbase.status.connected:
            return self.hbase.scan_table(self.hbase.spike_table, limit)
        if self.preferred == "hbase":
            raise RuntimeError(self.hbase.status.detail)
        return self._sqlite("spikes").head(limit).to_dict(orient="records")

    def decisions(self, limit: int) -> list[dict]:
        if self.hbase.status.connected:
            return self.hbase.scan_table(self.hbase.decision_table, limit)
        if self.preferred == "hbase":
            raise RuntimeError(self.hbase.status.detail)
        return self._sqlite("decisions").head(limit).to_dict(orient="records")
