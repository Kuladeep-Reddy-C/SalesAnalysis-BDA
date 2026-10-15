# Model Evaluation

The pipeline uses a chronological split after removing rows without the required 28-day history:

- Train: 2011-02-26 through 2016-02-28, 482,856 rows.
- Validation: 2016-02-29 through 2016-03-27, 7,392 rows.
- Test: 2016-03-28 through 2016-04-24, 7,392 rows.

The baseline predicts the same product-store pair's demand from seven days earlier. The Random Forest uses lag 1/7/28, trailing 7/28 day averages, price, weekday, month, and event indicator. Rolling features shift by one day, so current demand is excluded.

Measured test metrics from `results/metrics/model_metrics.csv`:

| Model | MAE | RMSE | WAPE |
|---|---:|---:|---:|
| Historical baseline | 1.3281 | 3.3600 | 1.1182 |
| Random Forest | 1.0699 | 2.4246 | 0.9009 |

WAPE is total absolute error divided by total absolute actual demand; it is reported as undefined when the denominator is zero. The Random Forest reduces MAE by approximately 19.4%, RMSE by approximately 27.8%, and WAPE by approximately 19.4% against this test baseline.

Measured local runtime was approximately 2.8 seconds preprocessing, 14.8 seconds model training, and 0.04 seconds test prediction in the successful run. These are workstation measurements, not cluster benchmarks. The recursive forecast uses the latest known price and recursively generated predictions for future lags; it is not validated as live demand.
