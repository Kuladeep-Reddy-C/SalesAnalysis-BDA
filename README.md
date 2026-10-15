# Retail Sales Forecasting and Demand Spike Detection

Review3 is a reproducible academic case study using the verified CSV outputs from Review2. It covers ingestion, validation, EDA, leakage-safe historical features, a weekly historical baseline, Random Forest regression, recursive seven-day forecasting, spike detection, measured metrics, and a Streamlit dashboard.

## Setup

```bash
cd ~/Documents/BigData/Review3
python -m venv .venv
.venv/bin/pip install -r requirements.txt
```

The source CSVs remain in `../Review2`. Existing Java loaders and HBase tables are not modified.

## Run

```bash
.venv/bin/python run_pipeline.py
.venv/bin/streamlit run dashboard/app.py
.venv/bin/pytest -q
```

The pipeline writes charts, metrics, predictions, a persisted model, and a daily joined dataset under `results/` and `models/`. The dashboard reads those persisted outputs and does not retrain on page refresh.

## Architecture

`Review2 CSV -> validation and many-to-one joins -> historical features -> chronological split -> baseline and Random Forest -> metrics, forecasts, spikes, charts -> Streamlit`

The HBase Java project is preserved as an existing backend. The tested Review3 run uses CSV inputs and reports that source in its run summary. It does not claim HBase ingestion or multi-node Spark performance. See `docs/ARCHITECTURE.md` and `docs/PROJECT_AUDIT.md`.

## Outputs

- `results/metrics/data_quality.csv`
- `results/metrics/model_metrics.csv`
- `results/metrics/run_summary.json`
- `results/predictions/test_predictions.csv`
- `results/predictions/seven_day_forecast.csv`
- `results/predictions/demand_spikes.csv`
- `results/charts/`
- `models/random_forest.pkl`

## Interpretation

The measured test-period Random Forest improves on the historical baseline. This is demand-based decision support only: the source data has no current inventory, lead time, or replenishment cost, and therefore the application does not invent stockout probabilities or savings.
