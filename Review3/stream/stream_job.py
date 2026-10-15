from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from analytics.spark_support import create_spark_session


def run(input_dir: str = "stream_input", output_dir: str = "results/stream", checkpoint_dir: str = "results/checkpoints/stream") -> None:
    """Process replayed historical JSON batches with Spark Structured Streaming."""
    from pyspark.sql import functions as F
    from pyspark.sql.types import DoubleType, StringType, StructField, StructType

    schema = StructType([
        StructField("item_id", StringType(), False),
        StructField("store_id", StringType(), False),
        StructField("d", StringType(), False),
        StructField("sales", DoubleType(), False),
        StructField("date", StringType(), False),
        StructField("stream_type", StringType(), False),
    ])
    spark = create_spark_session("RetailDemandSimulatedStream")
    spark.sparkContext.setLogLevel("WARN")
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    Path(checkpoint_dir).mkdir(parents=True, exist_ok=True)
    metrics_path = Path(output_dir) / "microbatch_metrics.jsonl"
    spikes_path = Path(output_dir) / "simulated_spikes.jsonl"
    started = time.perf_counter()

    def process_batch(batch, batch_id: int) -> None:
        batch_started = time.perf_counter()
        batch = batch.withColumn("date", F.to_date("date"))
        summary = batch.agg(F.count("sales").alias("rows"), F.sum("sales").alias("units"), F.countDistinct("item_id").alias("items")).first().asDict()
        summary.update({"batch_id": batch_id, "processed_at": time.time(), "stream_type": "simulated_historical_replay", "latency_seconds": time.perf_counter() - batch_started})
        summary["rows_per_second"] = float(summary["rows"] / summary["latency_seconds"]) if summary["latency_seconds"] else 0.0
        with metrics_path.open("a") as handle:
            handle.write(json.dumps(summary) + "\n")
        threshold = batch.groupBy("item_id", "store_id").agg(F.avg("sales").alias("mean_sales"), F.max("sales").alias("max_sales")).where(F.col("max_sales") >= F.col("mean_sales") * 3).withColumn("batch_id", F.lit(batch_id)).withColumn("stream_type", F.lit("simulated_historical_replay"))
        with spikes_path.open("a") as handle:
            for row in threshold.toJSON().collect():
                handle.write(row + "\n")

    query = (spark.readStream.schema(schema).json(input_dir)
        .writeStream.foreachBatch(process_batch)
        .option("checkpointLocation", checkpoint_dir)
        .trigger(availableNow=True)
        .start())
    query.awaitTermination()
    print(json.dumps({"stream_type": "simulated_historical_replay", "runtime_seconds": time.perf_counter() - started, "metrics": str(metrics_path), "spikes": str(spikes_path)}, indent=2))
    spark.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the simulated historical Spark stream")
    parser.add_argument("--input", default="stream_input")
    parser.add_argument("--output", default="results/stream")
    parser.add_argument("--checkpoint", default="results/checkpoints/stream")
    args = parser.parse_args()
    run(args.input, args.output, args.checkpoint)
