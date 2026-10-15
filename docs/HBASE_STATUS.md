# HBase Status

Review2 contains loaders for `retail_sales`, `retail_prices`, and `retail_calendar`, configured for HDFS-backed HBase. Review3 does not modify those tables.

During the audit, `hbase shell` reached the client but timed out while querying ZooKeeper. Therefore the live table descriptors and current row counts remain unverified. Review3 runs from the CSV exports and displays that source explicitly. This avoids claiming a successful HBase analytics read when the connection was unavailable.
