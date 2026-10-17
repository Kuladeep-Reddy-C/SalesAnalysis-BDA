from __future__ import annotations

import csv
import json
import sys
from operator import add
from pathlib import Path

_PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from analytics.spark_support import create_spark_session
from config import Config

PROFILE = {
    "id": "scenario-3-store-category-mix",
    "title": "Store/category mix",
    "question": "Which store and category combinations carry the strongest demand?",
    "purpose": "Store-category comparison that remains useful when more stores are loaded.",
    "key_description": "store_id + cat_id",
    "project": lambda row: (f"{row[3]} @ {row[2]}", row[5]),
    "filter": lambda row: row[5] > 0,
}


def parse_sales(line: str) -> tuple[str, str, str, str, str, float]:
    row = next(csv.reader([line]))
    return row[1], row[2], row[3], row[4], row[6], float(row[7])


def execute_rdd(raw, profile: dict | None = None) -> dict:
    profile = profile or PROFILE
    header = raw.first()
    records = (
        raw.filter(lambda line: line != header)
        .map(parse_sales)
        .filter(profile["filter"])
        .persist()
    )
    projected = records.map(profile["project"])
    key_values = projected.flatMap(lambda pair: [(pair[0], pair[1])])
    totals = key_values.reduceByKey(add)
    grouped = key_values.groupByKey()
    observation_counts = grouped.mapValues(lambda values: sum(1 for _ in values))
    sorted_counts = observation_counts.sortByKey().take(8)
    top_totals = totals.sortBy(lambda pair: pair[1], ascending=False).take(8)
    partition_preview = records.mapPartitionsWithIndex(
        lambda index, values: [(index, sum(1 for _ in values))]
    ).collect()

    return {
        "id": profile["id"],
        "title": profile["title"],
        "question": profile["question"],
        "purpose": profile["purpose"],
        "key_description": profile["key_description"],
        "input_rows_after_filter": records.count(),
        "partitions": records.getNumPartitions(),
        "partition_preview": [{"partition": key, "rows": value} for key, value in partition_preview],
        "top_totals": [{"key": key, "value": value} for key, value in top_totals],
        "sorted_key_sample": [{"key": key, "observations": value} for key, value in sorted_counts],
        "concepts": {
            "transformations": ["map", "filter", "flatMap", "reduceByKey", "groupByKey", "mapValues", "sortByKey", "mapPartitionsWithIndex"],
            "actions": ["first", "count", "take", "collect"],
            "persistence": str(records.getStorageLevel()),
            "lineage": records.toDebugString().decode("utf-8", errors="replace"),
            "dag": "map/filter are narrow stages; reduceByKey, groupByKey, and sortByKey introduce shuffle stages.",
            "fault_tolerance": "If a partition is lost, Spark can recompute it from the CSV and this transformation lineage.",
        },
    }


def run(config: Config | None = None, spark=None, raw=None, output: Path | None = None) -> dict:
    """Run Store/Category Mix RDD analysis (Scenario 3)."""
    if sys.version_info >= (3, 14):
        import pyspark
        if pyspark.__version__.startswith("3."):
            raise RuntimeError(
                "Python 3.14 requires PySpark 4.x for Python RDD execution. "
                "Install the pinned dependencies with: .venv/bin/pip install -r requirements.txt"
            )
    config = config or Config()
    config.prepare()
    output = output or config.results / "metrics" / "rdd_lab3_summary.json"

    should_stop = False
    if spark is None:
        spark = create_spark_session("RetailDemandLabRDDLab3")
        spark.sparkContext.setLogLevel("WARN")
        should_stop = True

    try:
        if raw is None:
            raw = spark.sparkContext.textFile(str(config.sales_path))
        profile_res = execute_rdd(raw, PROFILE)
        summary = {
            "engine": "pyspark-rdd",
            "spark_version": spark.version,
            "master": spark.sparkContext.master,
            "input": str(config.sales_path),
            "profile_count": 1,
            "profiles": [profile_res],
        }
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(summary, indent=2))
        return profile_res
    finally:
        if should_stop:
            spark.stop()


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, indent=2))
