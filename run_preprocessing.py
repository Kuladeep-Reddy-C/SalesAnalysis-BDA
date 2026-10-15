#!/usr/bin/env python3
"""Run the end-to-end dataset preprocessing pipeline.

Ingests raw data from `datasets/`, validates schemas, performs quality auditing,
joins sales with calendar and prices, imputes missing values, engineers lag & rolling features,
and exports all clean modeling and partitioned datasets to `preprocessed_data/`.
"""

import argparse
import json
import os
from pathlib import Path
from analytics.preprocess import run_preprocessing


def main():
    parser = argparse.ArgumentParser(description="Retail Demand Dataset Preprocessing")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "datasets",
        help="Path to folder containing raw datasets (sales, prices, calendar)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "preprocessed_data",
        help="Path to folder where preprocessed results will be saved",
    )
    parser.add_argument("--test-days", type=int, default=28, help="Number of test days for holdout")
    parser.add_argument("--validation-days", type=int, default=28, help="Number of validation days")
    args = parser.parse_args()

    print(f"\n==================================================")
    print(f"  Starting Retail Demand Dataset Preprocessing")
    print(f"==================================================")
    print(f"Input directory:  {args.input_dir.resolve()}")
    print(f"Output directory: {args.output_dir.resolve()}\n")

    summary = run_preprocessing(
        input_dir=args.input_dir,
        output_dir=args.output_dir,
    )

    # Create processed_data alias symlink for maximum compatibility
    symlink_path = args.output_dir.parent / "processed_data"
    if not symlink_path.exists() and symlink_path != args.output_dir:
        try:
            symlink_path.symlink_to(args.output_dir.name)
            print(f"Created convenience symlink: {symlink_path} -> {args.output_dir.name}")
        except Exception:
            pass

    print(f"\nPreprocessing successfully completed in {summary['runtime_seconds']} seconds!")
    print(f"\nGenerated 3 Key Artifacts in '{args.output_dir.name}/':")
    for name, meta in summary["output_datasets"].items():
        size_str = f" ({meta['size_mb']} MB)" if "size_mb" in meta else ""
        cols_str = f", {meta['cols']} cols" if "cols" in meta else ""
        rows_str = f"{meta['rows']:>8,} rows" if "rows" in meta else f"{meta['type']:>8}"
        desc = f" [{meta['description']}]" if "description" in meta else ""
        print(f"  - {meta['file']:<26} : {rows_str}{cols_str}{size_str}{desc}")

    print(f"==================================================\n")


if __name__ == "__main__":
    main()