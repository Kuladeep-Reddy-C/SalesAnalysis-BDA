from __future__ import annotations


def spark_available() -> bool:
    try:
        import pyspark  # noqa: F401
        return True
    except ImportError:
        return False


def create_spark_session(app_name: str = "RetailForecasting"):
    from pyspark.sql import SparkSession
    return (SparkSession.builder.master("local[*]")
            .appName(app_name)
            .config("spark.sql.shuffle.partitions", "4")
            .getOrCreate())
