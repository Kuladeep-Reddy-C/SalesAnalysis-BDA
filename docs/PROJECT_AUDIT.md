# Project Audit

## Verified environment

- OS: Linux / Arch-based workstation.
- Java: OpenJDK 17.0.20.1.
- Maven: 3.9.16.
- Hadoop: 3.4.2 under `/opt/hadoop-3.4.2`.
- HBase: 2.6.7-hadoop3 under `/opt/hbase`.
- Spark was not installed on PATH during the initial audit. The Review3 virtual environment installs PySpark 3.5.9, but the tested pipeline uses its Pandas execution path and records that fact.
- HBase descriptor inspection timed out at ZooKeeper; no HBase table was modified.

## Input schemas

Sales (`Review2/sales_processed_clean.csv`): `id,item_id,dept_id,cat_id,store_id,state_id,d,sales`.
Prices (`Review2/prices_processed_clean.csv`): `store_id,item_id,wm_yr_wk,sell_price`.
Calendar (`Review2/calendar_processed_clean.csv`): `d,date,wm_yr_wk,weekday,month,year,event_name_1,event_type_1,event_name_2,event_type_2,snap_CA,snap_TX,snap_WI`.

## Data findings

- Sales: 505,032 rows, 264 products, 1 store, 1 state, 1,913 relative days, total units 492,504.
- Prices: 204,234 rows, 1 store, 903 products, 282 weeks.
- Calendar: 1,969 rows, 2011-01-29 through 2016-06-19.
- No malformed numeric values, negative sales/prices, or duplicate natural keys were found by the audit checks.
- The sales-to-calendar join matched all rows.
- The sales-to-price join left 96,789 unmatched rows. The analytics pipeline imputes missing prices with the item median and then the global median; this is reported rather than silently dropped.

## Existing HBase project

Review2 Java loaders write to `retail_sales`, `retail_prices`, and `retail_calendar`. The loader families are `product`/`sales`, `price`, and `calendar`. The loaders themselves were not changed. Their hard-coded CSV paths refer to workspace-root files, while the actual CSVs are currently under `Review2`; Review3 therefore reads the verified Review2 paths directly.

## Risks and limitations

The dataset has one store, so store comparison is structurally limited. HBase availability was not verified because ZooKeeper was unreachable during the audit. The completed analytics run is local Pandas execution, not a measured cluster run. Future prices are unavailable for many products, so the seven-day forecast uses the latest known product-store price and should be treated as a demonstration forecast.
