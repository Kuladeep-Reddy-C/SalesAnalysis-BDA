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
            try:
                res = self.hbase.scan_table(self.hbase.metrics_table)
                if res:
                    return res
            except Exception:
                pass
        if self.sqlite_path.exists():
            try:
                return self._sqlite("metrics").to_dict(orient="records")
            except Exception:
                pass
        csv_p = self.results / "metrics" / "model_metrics.csv"
        if csv_p.exists():
            return pd.read_csv(csv_p).to_dict(orient="records")
        raise RuntimeError("No metrics found")

    def forecasts(self, item_id: str, store_id: str | None = None) -> list[dict]:
        if self.hbase.status.connected:
            try:
                res = self.hbase.get_forecast(item_id, store_id)
                if res:
                    return res
            except Exception:
                pass
        if self.sqlite_path.exists():
            try:
                frame = self._sqlite("forecasts")
                frame = frame[frame["item_id"] == item_id]
                if store_id:
                    frame = frame[frame["store_id"] == store_id]
                return frame.to_dict(orient="records")
            except Exception:
                pass
        csv_p = self.results / "predictions" / "seven_day_forecast.csv"
        if csv_p.exists():
            df = pd.read_csv(csv_p)
            df = df[df["item_id"] == item_id]
            if store_id:
                df = df[df["store_id"] == store_id]
            return df.to_dict(orient="records")
        return []

    def spikes(self, limit: int) -> list[dict]:
        if self.hbase.status.connected:
            try:
                res = self.hbase.scan_table(self.hbase.spike_table, limit)
                if res:
                    return res
            except Exception:
                pass
        if self.sqlite_path.exists():
            try:
                return self._sqlite("spikes").head(limit).to_dict(orient="records")
            except Exception:
                pass
        csv_p = self.results / "predictions" / "demand_spikes.csv"
        if csv_p.exists():
            return pd.read_csv(csv_p).head(limit).to_dict(orient="records")
        return []

    def decisions(self, limit: int) -> list[dict]:
        if self.hbase.status.connected:
            try:
                res = self.hbase.scan_table(self.hbase.decision_table, limit)
                if res:
                    return res
            except Exception:
                pass
        if self.sqlite_path.exists():
            try:
                return self._sqlite("decisions").head(limit).to_dict(orient="records")
            except Exception:
                pass
        csv_p = self.results / "metrics" / "forecast_uplift_decision.csv"
        if csv_p.exists():
            return pd.read_csv(csv_p).head(limit).to_dict(orient="records")
        return []
