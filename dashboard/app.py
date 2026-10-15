from pathlib import Path
import json
import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / 'results'
st.set_page_config(page_title='Retail Demand Lab', layout='wide')
st.title('Retail Demand Lab')
st.caption('Historical batch analytics. Forecasts are demand estimates, not live inventory or stockout calculations.')
summary_path = RESULTS / 'metrics' / 'run_summary.json'
if not summary_path.exists():
    st.warning('Run `python -m analytics.pipeline` from Review3 before opening the dashboard.')
    st.stop()
summary = json.loads(summary_path.read_text())
metrics = pd.read_csv(RESULTS / 'metrics' / 'model_metrics.csv')
predictions = pd.read_csv(RESULTS / 'predictions' / 'test_predictions.csv', parse_dates=['date'])
forecast_path = RESULTS / 'predictions' / 'seven_day_forecast.csv'
forecast = pd.read_csv(forecast_path, parse_dates=['forecast_date']) if forecast_path.exists() else pd.DataFrame()
decision_path = RESULTS / 'metrics' / 'forecast_uplift_decision.csv'
decision = pd.read_csv(decision_path) if decision_path.exists() else pd.DataFrame()
daily = pd.read_csv(RESULTS / 'daily_dataset.csv', parse_dates=['date'])
spikes_path = RESULTS / 'predictions' / 'demand_spikes.csv'
spikes = pd.read_csv(spikes_path, parse_dates=['date']) if spikes_path.exists() else pd.DataFrame()
importance_path = RESULTS / 'metrics' / 'feature_importance.csv'
importance = pd.read_csv(importance_path) if importance_path.exists() else pd.DataFrame()
stream_metrics_path = RESULTS / 'stream' / 'microbatch_metrics.jsonl'
stream_metrics = pd.read_json(stream_metrics_path, lines=True) if stream_metrics_path.exists() else pd.DataFrame()

cols = st.columns(4)
cols[0].metric('Total sales', f"{daily.sales.sum():,.0f}")
cols[1].metric('Products', daily.item_id.nunique())
cols[2].metric('Stores', daily.store_id.nunique())
cols[3].metric('Rows', f"{len(daily):,}")
st.write(f"Coverage: {daily.date.min().date()} to {daily.date.max().date()} | Source: Review2 CSV files | Mode: {summary['execution_mode']}")
if len(stream_metrics):
    st.subheader('Simulated live replay')
    st.warning('Simulated stream replaying historical data. This is not a live external feed.')
    st.write(f"Processed micro-batches: {len(stream_metrics):,} | Replayed rows: {int(stream_metrics['rows'].sum()):,}")
    st.dataframe(stream_metrics, use_container_width=True)

trend = daily.groupby('date', as_index=False).sales.sum().set_index('date')
st.subheader('Sales trend')
st.line_chart(trend)

left, right = st.columns(2)
with left:
    st.subheader('Model performance')
    st.dataframe(metrics, use_container_width=True)
with right:
    st.subheader('Top products')
    st.dataframe(daily.groupby('item_id', as_index=False).sales.sum().nlargest(10, 'sales'), use_container_width=True)

if len(importance):
    st.subheader('Random Forest feature importance')
    st.bar_chart(importance.set_index('feature'))

st.subheader('Forecast evaluation')
selected_item = st.selectbox('Product', sorted(predictions.item_id.unique()))
selected = predictions[predictions.item_id == selected_item].groupby('date')[['sales', 'rf_prediction']].sum()
st.line_chart(selected)
st.dataframe(predictions[predictions.item_id == selected_item].tail(20), use_container_width=True)
if len(forecast):
    st.subheader('Seven-day forecast')
    forecast_item = forecast[forecast.item_id == selected_item]
    st.line_chart(forecast_item.set_index('forecast_date')[['predicted_sales']])
    st.dataframe(forecast_item, use_container_width=True)

st.subheader('Demand spikes')
st.write(f"Flagged observations: {len(spikes):,}")
if len(spikes):
    st.dataframe(spikes[['date', 'item_id', 'store_id', 'sales', 'expected_sales', 'spike_score', 'reason']].sort_values('spike_score', ascending=False).head(100), use_container_width=True)
else:
    st.info('No qualifying spikes were detected.')

st.subheader('Inventory decision support')
if len(decision):
    st.caption('Forecast-dependent signal: rising demand means the seven-day forecast exceeds the recent seven-day total by more than 10%.')
    st.dataframe(decision.head(25), use_container_width=True)
recent = daily.sort_values('date').groupby(['item_id', 'store_id']).tail(28).groupby(['item_id', 'store_id']).sales.mean().reset_index(name='recent_mean')
recommendations = recent.sort_values('recent_mean', ascending=False).head(10)
st.dataframe(recommendations.assign(recommendation='Prioritize demand review; inventory and lead-time data were not provided.'), use_container_width=True)
