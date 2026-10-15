# HBase Status

Review2 contains loaders for `retail_sales`, `retail_prices`, and `retail_calendar`, configured for HDFS-backed HBase. Review3 does not modify those tables.

During the audit, `hbase shell` reached the client but timed out while querying ZooKeeper. Therefore the live table descriptors and current row counts remain unverified. Review3 runs from the CSV exports and displays that source explicitly. This avoids claiming a successful HBase analytics read when the connection was unavailable.

Review3 now provides an HBase Thrift serving adapter in `api/hbase_store.py`. With `SERVING_BACKEND=hbase`, the API requires HBase Thrift; with `auto`, it attempts HBase and reports/falls back to SQLite when unavailable. The adapter uses only new serving tables `retail_forecasts` and `retail_spikes`, with row key `item_id#store_id#yyyy-mm-dd`. Existing source tables are never altered.

The verified local fallback is `serving/store.py`, which creates `results/serving.sqlite3` from persisted forecasts, spikes, decisions, and metrics. Current machine status remains: HBase Thrift/ZooKeeper is unavailable, so the tested API active backend is SQLite.
