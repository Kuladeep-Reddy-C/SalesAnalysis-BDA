# Faculty Review Guide

1. State the question: can historical product demand support a seven-day planning forecast?
2. Show the audit: CSV schemas, 505,032 sales rows, one-store limitation, and complete calendar join.
3. Explain the pipeline: validated many-to-one joins, imputed unmatched prices, and daily product-store grain.
4. Show the charts: trend, top products, price association, and event context.
5. Explain leakage prevention: historical lags and shifted rolling windows, followed by chronological splitting.
6. Compare `lag_7` baseline with Random Forest on identical test dates.
7. Open the dashboard and show metrics, forecast, spike table, and demand-based recommendations.
8. Explain the decision: prioritize review of products with high recent or forecast demand; no inventory claim is made without stock and lead-time data.
9. Explain performance: local Pandas run, measured timings, no fabricated cluster speedup.
10. Close with limitations: one store, missing exact prices, HBase service unavailable during audit, and historical rather than live data.

Likely questions:

- **Why not random splitting?** Time-series random splitting can let future patterns influence training and overstate performance.
- **Why use a baseline?** It gives a transparent benchmark for whether the model adds value.
- **Is this real-time?** No. The source is historical batch data; any replay would be simulated.
- **Why are some prices imputed?** Exact store-item-week price rows are missing; the missing count is reported rather than silently dropping sales.
- **Can this calculate reorder quantities?** Not honestly without current inventory, lead time, service level, and supply constraints.
- **Is Spark demonstrated?** The project contains PySpark support and dependency configuration, but the measured run in this environment is explicitly reported as local Pandas execution. No distributed claim is made.
