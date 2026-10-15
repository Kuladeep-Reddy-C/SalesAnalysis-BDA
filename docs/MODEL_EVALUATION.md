# Model Evaluation

The pipeline uses a chronological split after removing rows without the required 28-day history:

- Train: 2011-02-26 through 2016-02-28, 482,856 rows.
- Validation: 2016-02-29 through 2016-03-27, 7,392 rows.
- Test: 2016-03-28 through 2016-04-24, 7,392 rows.

The evaluation compares seven baselines with the Random Forest: all-zero, global mean, item mean, last value, seasonal naive, 28-day moving average, and SBA Croston. The Random Forest uses lag 1/7/28, trailing 7/28 day averages, price, weekday, month, and event indicator. Rolling features shift by one day, so current demand is excluded.

Measured test metrics from `results/metrics/model_metrics.csv`:

| Model | MAE | RMSE | WAPE |
|---|---:|---:|---:|
| 28-day moving average | 1.0601 | 2.4059 | 0.8926 |
| Random Forest | 1.0699 | 2.4246 | 0.9009 |
| Seasonal naive (7 days) | 1.3281 | 3.3600 | 1.1182 |

WAPE is total absolute error divided by total absolute actual demand; it is reported as undefined when the denominator is zero. The 28-day moving average is the strongest measured benchmark in this run. Random Forest remains better than the seven-day seasonal naive, but it does not beat the 28-day moving average. The rolling-origin evaluation is available in `results/metrics/horizon_metrics.csv`: it uses four weekly origins and recursively forecasts horizons 1 through 7. Random Forest is stronger at horizons 1-4 in this run; the 28-day moving average is stronger at horizons 5-7. This is more realistic than a single holdout with actual test-period lags.

Measured local runtime was approximately 2.8 seconds preprocessing, 14.8 seconds model training, and 0.04 seconds test prediction in the successful run. These are workstation measurements, not cluster benchmarks. The recursive forecast uses the latest known price and recursively generated predictions for future lags; it is not validated as live demand.
