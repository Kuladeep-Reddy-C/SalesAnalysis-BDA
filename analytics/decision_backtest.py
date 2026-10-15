from __future__ import annotations

import pandas as pd
from scipy.stats import spearmanr

from analytics.preprocess import build_daily_dataset, read_inputs
from analytics.rolling_backtest import _forecast_origin
from sklearn.ensemble import RandomForestRegressor
from analytics.pipeline import FEATURES
from analytics.preprocess import add_features
from config import Config


def run(config: Config | None = None, origins: int = 4, top_fraction: float = 0.10, minimum_volume: float = 3.0) -> pd.DataFrame:
    config = config or Config()
    sales, prices, calendar = read_inputs(config.sales_path, config.prices_path, config.calendar_path)
    daily, _ = build_daily_dataset(sales, prices, calendar)
    dates = sorted(daily.date.unique())
    final_test = dates[-config.test_days]
    rows = []
    for index in range(origins):
        origin = final_test - pd.Timedelta(days=7 * (origins - index))
        history = daily[daily.date <= origin]
        future = daily[(daily.date > origin) & (daily.date <= origin + pd.Timedelta(days=7))]
        if future.empty:
            continue
        trailing = (history.sort_values('date').groupby(['item_id', 'store_id']).tail(28)
                    .groupby(['item_id', 'store_id'], as_index=False)
                    .agg(trailing_28=('sales', 'sum'), latest_price=('sell_price', 'last')))
        actual = future.groupby(['item_id', 'store_id'], as_index=False).agg(actual_7=('sales', 'sum'))
        scored = trailing.merge(actual, on=['item_id', 'store_id'], how='inner')
        scored['trailing_7_equivalent'] = scored['trailing_28'] / 4.0
        scored['realised_uplift'] = (scored.actual_7 - scored.trailing_7_equivalent) / scored.trailing_7_equivalent.replace(0, pd.NA)
        scored['value'] = scored.actual_7 * scored.latest_price
        featured_history = add_features(history).dropna(subset=FEATURES)
        model = RandomForestRegressor(n_estimators=40, max_depth=10, min_samples_leaf=3, random_state=config.random_seed, n_jobs=-1)
        model.fit(featured_history[FEATURES], featured_history['sales'])
        future_features = future.copy()
        future_features['horizon'] = (future_features['date'] - origin).dt.days
        predictions = _forecast_origin(model, history, future_features)
        forecast_scores = predictions.groupby(['item_id', 'store_id'], as_index=False).agg(forecast_7=('random_forest_prediction', 'sum'))
        scored = scored.merge(forecast_scores, on=['item_id', 'store_id'], how='inner')
        scored['forecast_uplift'] = (scored.forecast_7 - scored.trailing_28) / scored.trailing_28.replace(0, pd.NA)
        rankings = {
            'forecast_uplift': scored.assign(score=scored['forecast_uplift']),
            'trailing_volume': scored.assign(score=scored['trailing_28']),
        }
        for ranking_name, frame in rankings.items():
            eligible = frame[frame.trailing_7_equivalent >= minimum_volume].sort_values('score', ascending=False)
            if eligible.empty:
                continue
            top_n = max(1, int(len(eligible) * top_fraction))
            top = eligible.head(top_n)
            rest = eligible.iloc[top_n:]
            correlation_frame = eligible[['score', 'realised_uplift']].dropna()
            correlation = correlation_frame['score'].rank().corr(correlation_frame['realised_uplift'].rank()) if len(correlation_frame) > 1 and correlation_frame['score'].nunique() > 1 and correlation_frame['realised_uplift'].nunique() > 1 else float('nan')
            rows.append({
                'origin': origin.date().isoformat(),
                'ranking': ranking_name,
                'eligible_items': len(eligible),
                'top_items': len(top),
                'top_mean_realised_uplift': float(top.realised_uplift.mean()),
                'rest_mean_realised_uplift': float(rest.realised_uplift.mean()) if len(rest) else 0.0,
                'top_mean_realised_value': float(top.value.mean()),
                'spearman_score_vs_realised_uplift': float(correlation),
            })
    result = pd.DataFrame(rows)
    result.to_csv(config.results / 'metrics' / 'decision_backtest.csv', index=False)
    return result


if __name__ == '__main__':
    print(run().to_string(index=False))
