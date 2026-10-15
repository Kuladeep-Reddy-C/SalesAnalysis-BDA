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

**Status:** Completed.

**What was there:** Missing price rows were imputed, but the project did not preserve an explicit availability signal or analyze whether unmatched rows clustered near product launch.

**What changed:** Added `is_available` to the joined daily dataset and added `price_availability_report`, which groups unmatched price rows by product age into `results/metrics/price_availability.csv`.

**Measured finding:** Unavailable prices are concentrated early in product history: unavailable rates are `62.4%` at age 0-28 days, `58.3%` at 29-90 days, `49.9%` at 91-365 days, and `11.3%` after 366 days. This supports treating missing prices as an availability signal rather than assuming the median price is always observed. The age-bucket evidence is persisted in `results/metrics/price_availability.csv`.

**Comparison result:** Retaining imputed rows produced MAE `1.0631`, RMSE `2.4000`, WAPE `0.8951`; training only on available-price rows produced MAE `1.0645`, RMSE `2.3970`, WAPE `0.8963`. Because exclusion did not improve WAPE and removes 92,169 training rows, the current policy remains retention plus explicit `is_available` reporting. Results are stored in `results/metrics/availability_model_comparison.csv`.

### Item 5: Add simulated real-time processing

**Status:** Configurable replay and streaming job completed; dashboard refresh is manual/API-backed rather than continuous.

**What was there:** The project only described simulated streaming as a future option and had no replay generator or Structured Streaming job.

**What changed:** Added `stream/replay.py` to emit historical sales as day-sized JSON micro-batches and `stream/stream_job.py` to consume them with Spark Structured Streaming, checkpointing, micro-batch summaries, and simulated spike output. Every output is labelled `simulated_historical_replay`.

**Validation:** Twenty-eight historical days produced 7,392 rows across 28 batches. Structured Streaming processed them successfully in approximately 7.6 seconds and wrote `results/stream/microbatch_metrics.jsonl` and `results/stream/simulated_spikes.jsonl`. The replay accepts an adjustable interval; each micro-batch records latency and rows/second. This is a replay of historical data, not a live external feed.

**Remaining work:** Add a dashboard Live tab that refreshes these serving outputs while keeping the simulated banner visible.

### Dashboard follow-up: simulated replay and feature transparency

**Status:** Completed.

**What changed:** The dashboard now displays available simulated-stream micro-batch metrics with a visible historical-replay warning and displays persisted Random Forest feature importance. The pipeline writes `results/metrics/feature_importance.csv`.

**Validation:** The code path is covered by syntax checks and the existing test suite; real stream metrics were already generated under `results/stream/`.

### Item 7: Compare and justify models

**Status:** Spark challenger code added; GBT validation blocked by local executor stability.

**What changed:** Added Spark MLlib `GBTRegressor` alongside Spark Random Forest. The Spark metrics output now includes `gbt_spark` using the same features and chronological test rows.

**Validation:** The Spark Random Forest path remains validated. The GBT fit was attempted with bounded settings, but the local Spark executor shut down before producing a new metrics artifact. No GBT performance claim is made. Feature ablation and time-aware tuning remain.

### Item 8: Make the business decision forecast-dependent

**Status:** Core decision logic completed.

**What was there:** Inventory support ranked recent demand, which could be done without a forecast.

**What changed:** Added `analytics/decision_support.py`. The pipeline now ranks product-store pairs by seven-day forecast uplift over the trailing seven-day demand, includes a revenue/value signal using the latest price, and labels rising demand when uplift exceeds 10%.

**Validation:** `results/metrics/forecast_uplift_decision.csv` and the dashboard decision section now depend on forecast output. The 10% threshold is an explicit planning assumption, not a measured financial claim.

### Decision validation follow-up

**Status:** Implemented and ready for real-data validation.

**What changed:** Added `analytics/decision_backtest.py` and `--decision-backtest`. It ranks eligible product-store pairs by rolling Random Forest forecast uplift, compares the ranking with trailing-volume ranking, applies a minimum trailing-28-day volume threshold, and measures realised next-seven-day uplift, realised value, and Spearman agreement.

**Validation target:** `results/metrics/decision_backtest.csv` will determine whether the forecast ranking adds realised uplift over the naive ranking.

**Measured result:** Across four origins, forecast-uplift top-decile realised uplift was `+33.0%`, `+27.9%`, `+42.9%`, and `-3.3%`; trailing-volume ranking produced `-5.3%`, `-8.6%`, `-18.5%`, and `-22.7%`. The forecast ranking added a useful signal in 3 of 4 origins, but correlations were low (`0.06` to `0.10`), so this is promising rather than conclusive. The comparison uses a seven-day-equivalent trailing baseline and a minimum 3-unit trailing volume.

**Status:** Preliminary validation completed; more origins are required for a production decision.

### Item 7 evidence follow-up: noise floor, confidence intervals, and weekly totals

**Status:** Completed for the available four-origin evidence.

**What changed:** Added `analytics/model_evidence.py` and `--model-evidence`. It aggregates rolling forecasts into seven-day item totals, computes model metrics, bootstraps item-level Random Forest versus moving-average absolute-error differences, and simulates a Poisson noise-floor WAPE distribution.

**Validation target:** `results/metrics/weekly_total_metrics.csv` and `results/metrics/model_evidence.json` now quantify whether a daily difference is larger than observed item-level noise.

**Measured result:** The 95% item-bootstrap interval for Random Forest minus moving-average MAE is `-0.0598` to `0.2214`, crossing zero. The project therefore does not claim a statistically significant Random Forest win; the moving average remains the safer headline benchmark on the available evidence.

### Item 9: Replace sparse-demand spike z-scores

**Status:** Completed.

**What was there:** Spike detection used a Gaussian-style trailing z-score despite sparse count demand.

**What changed:** `analytics/spikes.py` now uses a one-sided Poisson tail probability, a minimum expected-demand floor, and a transparent reason. Synthetic five-times spikes are injected and scored for precision and recall in `results/metrics/spike_validation.csv`.

**Validation:** The real pipeline produced `results/metrics/spike_validation.csv`; all 9 tests passed.

### Item 11: Add an API layer

**Status:** Completed.

**What was there:** Streamlit read persisted CSV files directly, with no backend API boundary.

**What changed:** Added `api/main.py` with FastAPI endpoints for health, metrics, forecasts, spikes, decisions, and run metadata. Added FastAPI and Uvicorn dependencies.

**Validation:** FastAPI TestClient returned HTTP 200 for `/health`, `/metrics`, and `/decisions`, with 8 metric rows and 100 decision records.

### Item 10: Use a real serving backend

**Status:** API connectivity implemented; HBase availability remains an environment blocker.

**What was there:** SQLite and FastAPI existed, but the API read CSV files directly and the dashboard/API had no HBase-aware backend selection.

**What changed:** Added `api/hbase_store.py` and `api/backend.py`. The API now attempts HBase Thrift in `auto` mode, can require it with `SERVING_BACKEND=hbase`, reports `/backend-status`, and falls back to SQLite when HBase is unavailable. HBase uses new serving tables `retail_forecasts` and `retail_spikes` with row key `item_id#store_id#yyyy-mm-dd`; existing source tables are never modified. SQLite now serves forecasts, spikes, decisions, and metrics.

**Validation:** HBase/ZooKeeper is still unavailable on this machine, so no HBase connection claim is made. The fallback API returned HTTP 200 for `/health`, `/backend-status`, `/metrics`, and `/decisions`; SQLite serving-store creation succeeded.

**App connectivity:** Streamlit now calls the API for backend status, metrics, spikes, decisions, and selected forecasts when `RETAIL_API_URL` is configured, while retaining the persisted-file fallback if the API is unavailable.

### Item 13: Add repeatable performance benchmarking

**Status:** Reference-engine benchmark completed; Spark-versus-Pandas and cluster scaling remain future measurements.

**What changed:** Added `analytics/benchmark.py` with two repeated runs at 10%, 50%, and 100% input fractions. It records input/output rows, timings, Python version, platform, and CPU metadata in `results/metrics/performance.csv` and `performance_environment.json`.

**Remaining limitation:** This is not yet a Spark-versus-Pandas or multi-node benchmark; the limitation is explicit in the output.

### Item 6: Make the project scale story credible

**Status:** Partial, with measured reference scaling.

**What changed:** Added the three-size repeated benchmark and documented the source as a processed single-store slice matching public M5 structure. The current data remains a development slice, not the full multi-store dataset.

**Measured evidence:** `results/metrics/performance.csv` contains two runs each at 10%, 50%, and 100% input fractions. Full-data scaling to all stores remains unproven because those source files are not present in this workspace.

### Item 12: Upgrade the dashboard

**Status:** Core diagnostics completed; live store refresh remains.

**What changed:** Added simulated replay visibility, feature importance, rolling-origin horizon error charts, residual diagnostics, forecast-uplift decisions, and API documentation.

**Remaining limitation:** The dashboard still reads persisted outputs directly rather than refreshing from HBase/SQLite through the API.

### Item 14: Rewrite claims and tests from measured evidence

**Status:** In progress.

**What changed:** Added explicit hypotheses, measured-output references, Spark engine evidence, stronger baselines, rolling-origin metrics, API/serving tests, and tracker-level blocker statements.

**Remaining work:** Add Spark/Pandas parity fixtures, formal no-leakage tests for rolling origins, and final source/licence verification for the original dataset terms.

**Parity update:** Added `analytics/spark_features.py` and a Spark/Pandas feature-parity test. The test reads a temporary CSV through Spark, compares lag and rolling features after their required history, and passes. This avoids the PySpark 3.5/Python 3.14 cloudpickle failure encountered when constructing a Spark DataFrame directly from Pandas.
