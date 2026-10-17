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
from analytics.rdd_lab1 import execute_rdd as exec1, PROFILE as p1
from analytics.rdd_lab2 import execute_rdd as exec2, PROFILE as p2
from analytics.rdd_lab3 import execute_rdd as exec3, PROFILE as p3
from analytics.rdd_lab4 import execute_rdd as exec4, PROFILE as p4
from analytics.spark_support import create_spark_session
from config import Config
import sys
from pathlib import Path


def run_rdd_lab(config: Config | None = None, output: Path | None = None) -> dict:
    """Run all four scenario-specific Spark RDD analyses (rdd_lab1 to rdd_lab4)."""
    if sys.version_info >= (3, 14):
        import pyspark
        if pyspark.__version__.startswith("3."):
            raise RuntimeError(
                "Python 3.14 requires PySpark 4.x for Python RDD execution. "
                "Install the pinned dependencies with: .venv/bin/pip install -r requirements.txt"
            )
    config = config or Config()
    config.prepare()
    output = output or config.results / "metrics" / "rdd_lab_summary.json"
    spark = create_spark_session("RetailDemandLabRDDLab")
    spark.sparkContext.setLogLevel("WARN")
    try:
        raw = spark.sparkContext.textFile(str(config.sales_path))
        profiles = [
            exec1(raw, p1),
            exec2(raw, p2),
            exec3(raw, p3),
            exec4(raw, p4),
        ]
        summary = {
            "engine": "pyspark-rdd",
            "spark_version": spark.version,
            "master": spark.sparkContext.master,
            "input": str(config.sales_path),
            "profile_count": len(profiles),
            "profiles": profiles,
        }
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(summary, indent=2))
        return summary
    finally:
        spark.stop()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the retail demand pipeline')
    parser.add_argument('--engine', choices=('pandas', 'spark'), default='spark')
    parser.add_argument('--rdd-lab', action='store_true', help='Run the four scenario-specific Spark RDD analyses')
    parser.add_argument('--rolling-backtest', action='store_true')
    parser.add_argument('--availability-comparison', action='store_true')
    parser.add_argument('--benchmark', action='store_true')
    parser.add_argument('--build-store', action='store_true')
    parser.add_argument('--decision-backtest', action='store_true')
    parser.add_argument('--load-hbase', action='store_true')
    parser.add_argument('--model-evidence', action='store_true')
    parser.add_argument('--serve', action='store_true', help='Launch FastAPI and React UI dashboard on http://localhost:8000')
    args = parser.parse_args()

    if args.serve:
        import uvicorn
        print("Starting Retail Demand Lab UI at http://localhost:8000 ...")
        uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=False)
        exit(0)

    if args.rdd_lab:
        print(json.dumps(run_rdd_lab(), indent=2))
        exit(0)

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
