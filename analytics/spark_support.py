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
            .config("spark.sql.shuffle.partitions", "16")
            .config("spark.driver.memory", "4g")
            .config("spark.executor.memory", "4g")
            # Keep local CSV analytics independent of the existing HBase/HDFS setup.
            .config("spark.hadoop.fs.defaultFS", "file:///")
            .getOrCreate())
