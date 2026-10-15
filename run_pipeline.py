import argparse
import json

from analytics.eda import generate_charts
from analytics.pipeline import run as run_pandas
from analytics.spark_pipeline import run as run_spark

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the retail demand pipeline')
    parser.add_argument('--engine', choices=('pandas', 'spark'), default='pandas')
    args = parser.parse_args()
    summary = run_spark() if args.engine == 'spark' else run_pandas()
    print(json.dumps(summary, indent=2))
    if args.engine == 'pandas':
        generate_charts()
