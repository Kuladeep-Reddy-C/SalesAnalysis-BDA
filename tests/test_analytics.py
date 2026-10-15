import pandas as pd
from analytics.metrics import regression_metrics
from analytics.preprocess import add_features, build_daily_dataset
from analytics.spikes import detect_spikes


def sample_daily(days=40):
    dates = pd.date_range('2020-01-01', periods=days)
    return pd.DataFrame({'item_id': ['x'] * days, 'store_id': ['s'] * days, 'date': dates, 'sales': list(range(days)), 'sell_price': [1.0] * days, 'is_event': [0] * days})


def test_lags_exclude_current_day():
    frame = add_features(sample_daily())
    assert pd.isna(frame.iloc[0].lag_1)
    assert frame.iloc[7].lag_7 == 0
    assert frame.iloc[28].rolling_28 == sum(range(28)) / 28


def test_join_is_many_to_one_and_reports_matches():
    sales = pd.DataFrame({'id':['i'], 'item_id':['x'], 'dept_id':['d'], 'cat_id':['c'], 'store_id':['s'], 'state_id':['q'], 'd':['d_1'], 'sales':[2.]})
    prices = pd.DataFrame({'store_id':['s'], 'item_id':['x'], 'wm_yr_wk':[1], 'sell_price':[3.]})
    calendar = pd.DataFrame({'d':['d_1'], 'date':['2020-01-01'], 'wm_yr_wk':[1], 'weekday':['Wednesday'], 'month':[1], 'year':[2020], 'event_name_1':['None'], 'event_name_2':['None']})
    result, joins = build_daily_dataset(sales, prices, calendar)
    assert len(result) == 1 and joins['unmatched_prices'] == 0


def test_zero_denominator_wape_is_nan():
    result = regression_metrics(pd.Series([0, 0]), pd.Series([0, 1]))
    assert pd.isna(result['wape'])


def test_spike_detection_requires_history():
    frame = sample_daily()
    frame.loc[39, 'sales'] = 100
    spikes = detect_spikes(frame)
    assert bool(spikes.iloc[39].is_spike)


def test_temporal_split_is_ordered():
    frame = sample_daily()
    dates = sorted(frame.date.unique())
    assert dates[-5] > dates[-10]
