import argparse
import json

from analytics.eda import generate_charts
from analytics.pipeline import run as run_pandas
from analytics.rolling_backtest import run as run_rolling_backtest
from analytics.availability_comparison import run as run_availability_comparison
from analytics.benchmark import run as run_benchmark
from analytics.decision_backtest import run as run_decision_backtest
from analytics.model_evidence import run as run_model_evidence
from serving.store import build_store
from serving.hbase_load import load as load_hbase
from analytics.spark_pipeline import run as run_spark

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the retail demand pipeline')
    parser.add_argument('--engine', choices=('pandas', 'spark'), default='pandas')
    parser.add_argument('--rolling-backtest', action='store_true')
    parser.add_argument('--availability-comparison', action='store_true')
    parser.add_argument('--benchmark', action='store_true')
    parser.add_argument('--build-store', action='store_true')
    parser.add_argument('--decision-backtest', action='store_true')
    parser.add_argument('--load-hbase', action='store_true')
    parser.add_argument('--model-evidence', action='store_true')
    args = parser.parse_args()
    summary = run_spark() if args.engine == 'spark' else run_pandas()
    print(json.dumps(summary, indent=2))
    if args.engine == 'pandas':
        generate_charts()
    if args.rolling_backtest:
        print(json.dumps(run_rolling_backtest(), indent=2))
    if args.availability_comparison:
        print(json.dumps(run_availability_comparison(), indent=2))
    if args.benchmark:
        print(run_benchmark().to_string(index=False))
    if args.build_store:
        print(build_store())
    if args.decision_backtest:
        print(run_decision_backtest().to_string(index=False))
    if args.model_evidence:
        print(json.dumps(run_model_evidence(), indent=2))
    if args.load_hbase:
        print(json.dumps(load_hbase(), indent=2))
