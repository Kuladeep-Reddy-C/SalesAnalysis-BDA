from __future__ import annotations

import matplotlib.pyplot as plt
from config import Config


def generate_charts(config: Config | None = None) -> None:
    config = config or Config()
    config.prepare()
    daily = __import__('pandas').read_csv(config.results / 'daily_dataset.csv', parse_dates=['date'])
    charts = config.results / 'charts'
    daily.groupby('date', as_index=False)['sales'].sum().plot(x='date', y='sales', title='Daily total sales', legend=False)
    plt.ylabel('Units sold'); plt.tight_layout(); plt.savefig(charts / 'daily_sales_trend.png'); plt.close()
    daily.groupby('item_id')['sales'].sum().nlargest(10).sort_values().plot.barh(title='Top 10 products by sales')
    plt.xlabel('Units sold'); plt.tight_layout(); plt.savefig(charts / 'top_products.png'); plt.close()
    daily.groupby('store_id')['sales'].sum().plot.bar(title='Sales by store')
    plt.ylabel('Units sold'); plt.tight_layout(); plt.savefig(charts / 'store_comparison.png'); plt.close()
    daily.sample(min(5000, len(daily)), random_state=42).plot.scatter(x='sell_price', y='sales', alpha=.25, title='Price versus sales')
    plt.tight_layout(); plt.savefig(charts / 'price_vs_sales.png'); plt.close()
    predictions = __import__('pandas').read_csv(config.results / 'predictions' / 'test_predictions.csv', parse_dates=['date'])
    predictions.groupby('date')[['sales', 'rf_prediction']].sum().plot(title='Actual versus predicted sales')
    plt.ylabel('Units sold'); plt.tight_layout(); plt.savefig(charts / 'actual_vs_predicted.png'); plt.close()
    metrics = __import__('pandas').read_csv(config.results / 'metrics' / 'model_metrics.csv').set_index('model')[['mae', 'rmse', 'wape']]
    metrics.plot.bar(title='Model performance comparison'); plt.tight_layout(); plt.savefig(charts / 'model_performance.png'); plt.close()
    spikes = __import__('pandas').read_csv(config.results / 'predictions' / 'demand_spikes.csv')
    if len(spikes):
        spikes['date'] = __import__('pandas').to_datetime(spikes['date'])
        spikes.groupby('date')['spike_score'].max().plot(title='Detected demand spikes')
        plt.ylabel('Spike score'); plt.tight_layout(); plt.savefig(charts / 'demand_spikes.png'); plt.close()


if __name__ == '__main__':
    generate_charts()
