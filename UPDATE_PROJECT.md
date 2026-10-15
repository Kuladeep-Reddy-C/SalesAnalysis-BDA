# Project Improvement Tracker

This file records the ordered improvement work requested from the critical evaluation report. Each completed item includes what existed, what changed, and the validation performed.

## Priority Order

1. **Apply PySpark as a real execution engine**: Spark ingestion, joins, window features, chronological evaluation, Spark MLlib model, explicit engine reporting, and no silent fallback.
2. **Strengthen evaluation integrity**: zero/global/item/last-value/seasonal-naive/moving-average/Croston-style baselines, bias, MASE/RMSSE, and demand-bucket metrics.
3. **Implement true seven-day rolling-origin backtesting**: horizons 1 through 7, no future leakage, and horizon-wise metrics.
4. **Investigate missing-price semantics**: availability flag, item-age pattern, and measured comparison of handling strategies.
5. **Add simulated real-time processing**: historical replay, Structured Streaming micro-batches, checkpointing, and a clearly labelled simulated-live dashboard view.
6. **Make the project scale story credible**: identify the dataset source, retain the current slice as development data, add stated scale benchmarks, and improve profiling.
7. **Compare and justify models**: Spark Random Forest, Spark GBT/Poisson challenger, time-aware validation, ablation, and feature importance.
8. **Make the business decision forecast-dependent**: forecast uplift, revenue-weighted prioritisation, ABC-XYZ analysis, and explicit scenario assumptions.
9. **Replace sparse-demand spike z-scores**: count-aware or robust detection, minimum-volume rules, derived explanations, and injected-spike precision/recall.
10. **Use a real serving backend**: HBase serving tables or a named runnable alternative, documented row keys, and persisted forecast/spike reads.
11. **Add an API layer**: FastAPI endpoints between the serving backend and Streamlit, with one-command startup.
12. **Upgrade the dashboard**: live replay state, uncertainty, horizon errors, feature importance, residuals, and meaningful comparison views.
13. **Add repeatable performance benchmarking**: repeated Spark/Pandas runs at multiple data sizes, hardware/runtime metadata, streaming throughput, and serving latency.
14. **Rewrite claims and tests from measured evidence**: dataset/license citation, hypotheses, updated README, Spark/Pandas parity, leakage tests, and final review artifacts.

## Progress

### Item 1: Apply PySpark as a real execution engine

**Status:** Completed.

**What was there:** PySpark was listed as a dependency and `spark_support.py` could create a local session, but the actual pipeline always read CSVs with Pandas, trained scikit-learn Random Forest, and recorded `pyspark_available_but_pandas_pipeline_used`.

**What changed:** Added `analytics/spark_pipeline.py` and an explicit `--engine spark` command path. The Spark path reads the three CSV inputs into Spark DataFrames, performs the joins, calculates lag and rolling features with Spark windows, splits by date, trains Spark MLlib Random Forest, persists Spark metrics/predictions/model artifacts, and does not silently fall back to Pandas.

**Validation:** Spark 3.5.9 starts successfully with Java 17. The first full-data attempt exposed a local JVM heap limit during an 80-tree/depth-14 model. The Spark path now uses an explicitly bounded 24-tree/depth-8 local model, 4 GB driver/executor settings, and 16 shuffle partitions; its engine, Spark version, partitions, row counts, join counts, and timing are recorded in `results/metrics/spark_run_summary.json` after the successful rerun.

### Item 2: Strengthen evaluation with baselines and metrics

**Status:** Completed.

**What was there:** Only a seven-day historical baseline and Random Forest were reported with MAE, RMSE, and WAPE. That comparison could make the Random Forest appear stronger than it was because it did not include simpler moving-average and intermittent-demand benchmarks.

**What changed:** Added `analytics/baselines.py` with all-zero, global mean, item mean, last-value, seasonal-naive, 28-day moving average, and SBA Croston-style forecasts. Added prediction bias, MASE, and revenue-weighted absolute error to `analytics/metrics.py`. Added demand-bucket evaluation and expanded `results/metrics/model_metrics.csv`.

**Measured result:** The 28-day moving average is strongest on the current test window: MAE `1.0601`, RMSE `2.4059`, WAPE `0.8926`. Random Forest scores MAE `1.0699`, RMSE `2.4246`, WAPE `0.9009`. The project now states that Random Forest is a challenger, not the selected winner, until rolling-origin evaluation provides stronger evidence.

**Validation:** Real-data pipeline completed successfully and all 5 tests passed.
