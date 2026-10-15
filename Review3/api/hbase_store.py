from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any


@dataclass
class HBaseStatus:
    configured: bool
    connected: bool
    detail: str


class HBaseServingStore:
    """Optional HBase serving adapter; never changes existing source tables."""

    def __init__(self) -> None:
        self.host = os.getenv("HBASE_THRIFT_HOST", "127.0.0.1")
        self.port = int(os.getenv("HBASE_THRIFT_PORT", "9090"))
        self.forecast_table = os.getenv("HBASE_FORECAST_TABLE", "retail_forecasts")
        self.spike_table = os.getenv("HBASE_SPIKE_TABLE", "retail_spikes")
        self.decision_table = os.getenv("HBASE_DECISION_TABLE", "retail_decisions")
        self.metrics_table = os.getenv("HBASE_METRICS_TABLE", "retail_metrics")
        self._connection = None
        self._status = HBaseStatus(False, False, "HBase Thrift adapter not attempted")

    def connect(self) -> HBaseStatus:
        try:
            import happybase
        except ImportError:
            self._status = HBaseStatus(False, False, "happybase is not installed")
            return self._status
        try:
            connection = happybase.Connection(host=self.host, port=self.port, timeout=2000, autoconnect=False)
            connection.open()
            self._connection = connection
            self._status = HBaseStatus(True, True, f"Connected to HBase Thrift at {self.host}:{self.port}")
        except Exception as exc:
            self._status = HBaseStatus(True, False, f"HBase Thrift unavailable: {type(exc).__name__}: {exc}")
        return self._status

    @property
    def status(self) -> HBaseStatus:
        return self._status

    def ensure_serving_tables(self) -> None:
        if not self._connection:
            raise RuntimeError(self._status.detail)
        existing = set(self._connection.tables())
        for name in (self.forecast_table, self.spike_table, self.decision_table, self.metrics_table):
            if name.encode() not in existing:
                self._connection.create_table(name, {"f": {}})

    @staticmethod
    def row_key(item_id: str, store_id: str, date: str) -> bytes:
        return f"{item_id}#{store_id}#{date}".encode()

    def put_forecast(self, item_id: str, store_id: str, date: str, values: dict[str, Any]) -> None:
        if not self._connection:
            raise RuntimeError(self._status.detail)
        table = self._connection.table(self.forecast_table)
        table.put(self.row_key(item_id, store_id, date), {f"f:{key}".encode(): str(value).encode() for key, value in values.items()})

    def get_forecast(self, item_id: str, store_id: str | None = None) -> list[dict[str, str]]:
        if not self._connection:
            raise RuntimeError(self._status.detail)
        table = self._connection.table(self.forecast_table)
        prefix = f"{item_id}#" if not store_id else f"{item_id}#{store_id}#"
        rows = []
        for key, values in table.scan(row_prefix=prefix.encode()):
            record = {"row_key": key.decode()}
            record.update({key.decode().replace("f:", ""): value.decode() for key, value in values.items()})
            rows.append(record)
        return rows

    def scan_table(self, table_name: str, limit: int = 1000) -> list[dict[str, str]]:
        if not self._connection:
            raise RuntimeError(self._status.detail)
        rows = []
        for key, values in self._connection.table(table_name).scan(limit=limit):
            record = {"row_key": key.decode()}
            record.update({key.decode().replace("f:", ""): value.decode() for key, value in values.items()})
            rows.append(record)
        return rows
