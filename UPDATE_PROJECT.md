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

### Item 3: Implement rolling-origin seven-day backtesting

**Status:** Completed.

**What was there:** The original test metrics were calculated from rows whose lag features could use actual values from the test period. That evaluated a one-step-style holdout, not a strict recursive seven-day forecast.

**What changed:** Added `analytics/rolling_backtest.py` and the `--rolling-backtest` command option. The implementation trains at four weekly origins, forecasts horizons 1 through 7 recursively, and writes `results/metrics/horizon_metrics.csv` plus `results/predictions/rolling_origin_predictions.csv`. Generated predictions are appended to temporary history; future actual sales are never used as lag inputs.

**Measured result:** Random Forest has lower WAPE than the 28-day moving average at horizons 1-4, while the moving average is better at horizons 5-7. The rolling run produced 7,392 predictions across four origins in approximately 141 seconds. The result supports a horizon-dependent model decision rather than a blanket claim that Random Forest wins.

**Validation:** Rolling-origin real-data run completed and all 7 tests passed.

### Item 4: Investigate missing-price semantics

**Status:** Investigation completed; handling comparison remains.

**What was there:** Missing price rows were imputed, but the project did not preserve an explicit availability signal or analyze whether unmatched rows clustered near product launch.

**What changed:** Added `is_available` to the joined daily dataset and added `price_availability_report`, which groups unmatched price rows by product age into `results/metrics/price_availability.csv`.

**Measured finding:** Unavailable prices are concentrated early in product history: unavailable rates are `62.4%` at age 0-28 days, `58.3%` at 29-90 days, `49.9%` at 91-365 days, and `11.3%` after 366 days. This supports treating missing prices as an availability signal rather than assuming the median price is always observed. The age-bucket evidence is persisted in `results/metrics/price_availability.csv`.

**Remaining work:** Add a measured model comparison with unavailable rows excluded versus retained with an `is_available` feature before changing the production training policy.

### Item 5: Add simulated real-time processing

**Status:** Core replay and streaming job completed; dashboard live tab remains.

**What was there:** The project only described simulated streaming as a future option and had no replay generator or Structured Streaming job.

**What changed:** Added `stream/replay.py` to emit historical sales as day-sized JSON micro-batches and `stream/stream_job.py` to consume them with Spark Structured Streaming, checkpointing, micro-batch summaries, and simulated spike output. Every output is labelled `simulated_historical_replay`.

**Validation:** Seven historical days produced 1,848 rows across 7 batches. Structured Streaming processed them successfully in approximately 4.8 seconds and wrote `results/stream/microbatch_metrics.jsonl` and `results/stream/simulated_spikes.jsonl`. This is a replay of historical data, not a live external feed.

**Remaining work:** Add a dashboard Live tab that refreshes these serving outputs while keeping the simulated banner visible.
