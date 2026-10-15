# Architecture

1. **Source**: Review2 CSV exports are the reproducible analytics input. Review2 also contains Java HBase loaders for `retail_sales`, `retail_prices`, and `retail_calendar`.
2. **Validation**: required columns, numeric types, non-negative values, nulls, duplicate natural keys, and join matches are reported.
3. **Join**: sales joins calendar on `d`, then prices on `store_id`, `item_id`, and `wm_yr_wk`. Both joins are validated as many-to-one to prevent row multiplication.
4. **Features**: lag 1, 7, and 28 days; trailing 7 and 28 day means excluding the current observation; price; weekday; month; and event indicator.
5. **Models**: seven reference baselines and a scikit-learn Random Forest in the reference path; Spark MLlib Random Forest in the Spark path. A Spark GBT challenger is implemented but did not produce a validated artifact because the local executor became unstable during the second fit.
6. **Outputs**: chronological test predictions, metrics, recursive seven-day forecast, spike records, charts, and a pickled model.
7. **Serving and presentation**: API endpoints expose persisted forecasts, spikes, metrics, and decisions. A local SQLite serving store is available as a runnable alternative to unavailable HBase. Streamlit displays persisted outputs and execution mode.
8. **Simulated stream**: `stream/replay.py` emits historical day-sized JSON batches and `stream/stream_job.py` processes them with Spark Structured Streaming, checkpointing, and labelled micro-batch outputs.
9. **Engine parity**: `analytics/spark_features.py` shares the Spark window-feature implementation and a fixture test verifies its lag/rolling outputs against the Pandas reference after each feature's required history.

No existing HBase tables are changed by Review3. The verified Spark run is local `local[*]`, not a multi-node speedup benchmark. HBase remains an optional external backend; SQLite is the verified local serving alternative.
