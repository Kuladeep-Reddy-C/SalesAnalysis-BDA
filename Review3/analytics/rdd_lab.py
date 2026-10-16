from __future__ import annotations

import csv
import json
import sys
from operator import add
from pathlib import Path

from analytics.spark_support import create_spark_session
from config import Config


PROFILES = (
    {
        "id": "person-1-product-velocity",
        "owner": "Person 1",
        "title": "Product velocity",
        "question": "Which products contribute the most demand, and how many sales observations support that result?",
        "purpose": "Product-level prioritisation for replenishment review.",
        "key_description": "item_id",
        "project": lambda row: (row[0], row[5]),
        "filter": lambda row: row[5] > 0,
    },
    {
        "id": "person-2-department-demand",
        "owner": "Person 2",
        "title": "Department demand",
        "question": "How is demand distributed across departments?",
        "purpose": "Department-level workload planning for category managers.",
        "key_description": "dept_id",
        "project": lambda row: (row[1], row[5]),
        "filter": lambda row: row[5] >= 0,
    },
    {
        "id": "person-3-store-category-mix",
        "owner": "Person 3",
        "title": "Store/category mix",
        "question": "Which store and category combinations carry the strongest demand?",
        "purpose": "Store-category comparison that remains useful when more stores are loaded.",
        "key_description": "store_id + cat_id",
        "project": lambda row: (f"{row[3]} @ {row[2]}", row[5]),
        "filter": lambda row: row[5] > 0,
    },
    {
        "id": "person-4-intermittent-demand",
        "owner": "Person 4",
        "title": "Intermittent demand activity",
        "question": "Which products have the most active selling days rather than only the largest totals?",
        "purpose": "Separate frequent activity from one-off high-volume demand.",
        "key_description": "item_id on positive-sales days",
        "project": lambda row: (row[0], 1.0),
        "filter": lambda row: row[5] > 0,
    },
)


def _parse_sales(line: str) -> tuple[str, str, str, str, str, float]:
    row = next(csv.reader([line]))
    return row[1], row[2], row[3], row[4], row[6], float(row[7])


def _run_profile(raw, profile: dict) -> dict:
    header = raw.first()
    records = (raw
               .filter(lambda line: line != header)
               .map(_parse_sales)
               .filter(profile["filter"])
               .persist())
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
        "owner": profile["owner"],
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


def run(config: Config | None = None, output: Path | None = None) -> dict:
    """Run four complete, scenario-specific RDD analyses over the sales data."""
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
        profiles = [_run_profile(raw, profile) for profile in PROFILES]
        summary = {
            "engine": "pyspark-rdd",
            "spark_version": spark.version,
            "master": spark.sparkContext.master,
            "input": str(config.sales_path),
            "profile_count": len(profiles),
            "profiles": profiles,
        }
        output.write_text(json.dumps(summary, indent=2))
        return summary
    finally:
        spark.stop()