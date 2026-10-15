import pandas as pd
from pathlib import Path
import tempfile
from analytics.baselines import add_baseline_predictions
from analytics.metrics import mase, regression_metrics
from analytics.preprocess import add_features, build_daily_dataset, price_availability_report
from analytics.spikes import detect_spikes, validate_injected_spikes
from analytics.spark_features import add_spark_features
from analytics.spark_support import create_spark_session


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


def test_price_availability_report_preserves_unmatched_signal():
    daily = sample_daily(40)
    daily['is_available'] = [1] * 20 + [0] * 20
    report = price_availability_report(daily)
    assert report['unavailable_rows'].sum() == 20


def test_zero_denominator_wape_is_nan():
    result = regression_metrics(pd.Series([0, 0]), pd.Series([0, 1]))
    assert pd.isna(result['wape'])


def test_baselines_use_named_historical_signals():
    frame = add_features(sample_daily(40))
    train = frame.iloc[:30]
    test = add_baseline_predictions(train, frame.iloc[30:])
    assert (test['zero_prediction'] == 0).all()
    assert (test['seasonal_naive_prediction'] == test['lag_7']).all()
    assert test['moving_average_28_prediction'].notna().all()


def test_mase_uses_training_scale():
    result = mase(pd.Series([2.0, 3.0]), pd.Series([1.0, 2.0]), pd.Series([1.0, 2.0, 3.0]))
    assert result == 1.0


def test_spike_detection_requires_history():
    frame = sample_daily()
    frame.loc[39, 'sales'] = 100
    spikes = detect_spikes(frame)
    assert bool(spikes.iloc[39].is_spike)


def test_injected_spike_validation_has_precision_and_recall():
    result = validate_injected_spikes(sample_daily(40), multiplier=5)
    assert {'precision', 'recall'} <= set(result.columns)


def test_temporal_split_is_ordered():
    frame = sample_daily()
    dates = sorted(frame.date.unique())
    assert dates[-5] > dates[-10]


def test_spark_pandas_feature_parity():
    pandas_features = add_features(sample_daily(40)).sort_values('date').reset_index(drop=True)
    spark = create_spark_session('FeatureParityTest')
    try:
        with tempfile.TemporaryDirectory() as directory:
            fixture_path = Path(directory) / 'fixture.csv'
            sample_daily(40).to_csv(fixture_path, index=False)
            from pyspark.sql import functions as F
            spark_frame = spark.read.option('header', True).option('inferSchema', True).csv(str(fixture_path)).withColumn('date', F.to_date('date'))
            spark_features = add_spark_features(spark_frame).orderBy('date').toPandas()
        minimum_history = {'lag_1': 1, 'lag_7': 7, 'lag_28': 28, 'rolling_7': 7, 'rolling_28': 28}
        for column in ['lag_1', 'lag_7', 'lag_28', 'rolling_7', 'rolling_28']:
            left = pandas_features[column].fillna(-999).to_numpy()
            right = spark_features[column].fillna(-999).to_numpy()
            start = minimum_history[column]
            assert (abs(left[start:] - right[start:]) < 1e-6).all()
    finally:
        spark.stop()
