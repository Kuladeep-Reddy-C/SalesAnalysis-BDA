# HBase Status

Review2 contains loaders for `retail_sales`, `retail_prices`, and `retail_calendar`, configured for HDFS-backed HBase. Review3 does not modify those tables.

During the audit, `hbase shell` reached the client but timed out while querying ZooKeeper. Therefore the live table descriptors and current row counts remain unverified. Review3 runs from the CSV exports and displays that source explicitly. This avoids claiming a successful HBase analytics read when the connection was unavailable.

Review3 now provides an HBase Thrift serving adapter in `api/hbase_store.py`. HBase is the API default and required backend; if it is unavailable, serving endpoints return an error rather than silently switching to SQLite. The adapter uses only new serving tables `retail_forecasts`, `retail_spikes`, `retail_decisions`, and `retail_metrics`, with forecast row key `item_id#store_id#yyyy-mm-dd`. Existing source tables are never altered.

The explicit offline fallback is `serving/store.py`, selected only with `SERVING_BACKEND=sqlite`. HBase is now running locally through HDFS, embedded ZooKeeper, HMaster, HRegionServer, and Thrift on port 9090. The serving loader populated 1,848 forecasts, 6,852 spikes, 264 decisions, and 8 metrics rows.
