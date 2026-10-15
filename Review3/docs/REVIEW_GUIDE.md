# Faculty Review Guide

1. State the question: can historical product demand support a seven-day planning forecast?
2. Show the audit: CSV schemas, 505,032 sales rows, one-store limitation, and complete calendar join.
3. Explain the pipeline: validated many-to-one joins, imputed unmatched prices, and daily product-store grain.
4. Show the charts: trend, top products, price association, and event context.
5. Explain leakage prevention: historical lags and shifted rolling windows, followed by chronological splitting.
6. Compare 3 Machine Learning models (Decision Tree vs. Random Forest vs. Gradient Boosting) on both Pandas and PySpark MLlib. Explain that Single Decision Tree establishes the baseline, Random Forest reduces variance via bagging, and Gradient Boosting wins as the champion model with the lowest MAE (1.0677) and WAPE (0.8990) by sequentially minimizing pseudo-residuals.
7. Open the dashboard and show metrics, forecast, spike validation, horizon errors, feature importance, simulated replay, API/serving story, and forecast-uplift recommendations.
8. Explain the decision: prioritize review of products with high recent or forecast demand; no inventory claim is made without stock and lead-time data.
9. Explain performance: local Spark and Pandas reference timings, repeated input-size benchmark, and no fabricated multi-node speedup.
10. Close with limitations: one store, missing exact prices, HBase service unavailable during audit, and historical rather than live data.

Likely questions:

- **Why are some prices imputed?** Exact store-item-week price rows are missing and cluster early in product age. Retained-imputation versus available-only metrics are compared; retention currently preserves more rows without improving WAPE when excluded.
- **Is Spark demonstrated?** Yes. `run_pipeline.py --engine spark` runs Spark DataFrames, Spark windows, and Spark MLlib Random Forest on the full available slice. It runs locally, so no cluster speedup is claimed.
