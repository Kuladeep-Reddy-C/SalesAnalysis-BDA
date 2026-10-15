# Architecture

1. **Source**: Review2 CSV exports are the reproducible analytics input. Review2 also contains Java HBase loaders for `retail_sales`, `retail_prices`, and `retail_calendar`.
2. **Validation**: required columns, numeric types, non-negative values, nulls, duplicate natural keys, and join matches are reported.
3. **Join**: sales joins calendar on `d`, then prices on `store_id`, `item_id`, and `wm_yr_wk`. Both joins are validated as many-to-one to prevent row multiplication.
4. **Features**: lag 1, 7, and 28 days; trailing 7 and 28 day means excluding the current observation; price; weekday; month; and event indicator.
5. **Models**: `lag_7` historical baseline and scikit-learn Random Forest. The project includes PySpark support utilities and PySpark in requirements, but the measured end-to-end run used Pandas fallback on this workstation.
6. **Outputs**: chronological test predictions, metrics, recursive seven-day forecast, spike records, charts, and a pickled model.
7. **Presentation**: Streamlit reads outputs only. It displays data source and execution mode.

No HBase tables are changed by Review3. No distributed speedup is claimed. HDFS/HBase integration is an optional future adapter because live HBase access could not be verified during the audit.
