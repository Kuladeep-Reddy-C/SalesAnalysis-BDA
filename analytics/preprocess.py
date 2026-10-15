from __future__ import annotations

from pathlib import Path
import pandas as pd

REQUIRED = {
    "sales": {"id", "item_id", "dept_id", "cat_id", "store_id", "state_id", "d", "sales"},
    "prices": {"store_id", "item_id", "wm_yr_wk", "sell_price"},
    "calendar": {"d", "date", "wm_yr_wk", "weekday", "month", "year"},
}


def _require_columns(frame: pd.DataFrame, required: set[str], name: str) -> None:
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"{name} is missing required columns: {sorted(missing)}")


def read_inputs(sales_path: Path, prices_path: Path, calendar_path: Path) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    sales = pd.read_csv(sales_path)
    prices = pd.read_csv(prices_path)
    calendar = pd.read_csv(calendar_path)
    for frame, name in ((sales, "sales"), (prices, "prices"), (calendar, "calendar")):
        _require_columns(frame, REQUIRED[name], name)
    sales["sales"] = pd.to_numeric(sales["sales"], errors="raise")
    prices["sell_price"] = pd.to_numeric(prices["sell_price"], errors="raise")
    calendar["date"] = pd.to_datetime(calendar["date"], errors="raise")
    if (sales["sales"] < 0).any() or (prices["sell_price"] < 0).any():
        raise ValueError("Sales and prices must be non-negative")
    return sales, prices, calendar


def quality_report(sales: pd.DataFrame, prices: pd.DataFrame, calendar: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for name, frame, key in (("sales", sales, ["id", "d"]), ("prices", prices, ["store_id", "item_id", "wm_yr_wk"]), ("calendar", calendar, ["d"])):
        rows.append({
            "dataset": name,
            "input_rows": len(frame),
            "null_cells": int(frame.isna().sum().sum()),
            "duplicate_key_rows": int(frame.duplicated(key).sum()),
            "key": "+".join(key),
        })
    return pd.DataFrame(rows)


def build_daily_dataset(sales: pd.DataFrame, prices: pd.DataFrame, calendar: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, int]]:
    merged = sales.merge(calendar, on="d", how="left", validate="many_to_one", indicator="calendar_match")
    unmatched_calendar = int((merged["calendar_match"] == "left_only").sum())
    merged = merged.merge(prices, on=["store_id", "item_id", "wm_yr_wk"], how="left", validate="many_to_one", indicator="price_match")
    unmatched_prices = int((merged["price_match"] == "left_only").sum())
    merged["sell_price"] = merged["sell_price"].fillna(merged.groupby("item_id")["sell_price"].transform("median"))
    merged["sell_price"] = merged["sell_price"].fillna(merged["sell_price"].median())
    merged["is_event"] = ((merged["event_name_1"].fillna("None") != "None") | (merged["event_name_2"].fillna("None") != "None")).astype(int)
    merged["date"] = pd.to_datetime(merged["date"])
    merged = merged.sort_values(["item_id", "store_id", "date"]).reset_index(drop=True)
    return merged, {"unmatched_calendar": unmatched_calendar, "unmatched_prices": unmatched_prices, "output_rows": len(merged)}


def add_features(daily: pd.DataFrame) -> pd.DataFrame:
    result = daily.copy().sort_values(["item_id", "store_id", "date"])
    group = result.groupby(["item_id", "store_id"], sort=False)["sales"]
    result["lag_1"] = group.shift(1)
    result["lag_7"] = group.shift(7)
    result["lag_28"] = group.shift(28)
    result["rolling_7"] = group.transform(lambda values: values.shift(1).rolling(7, min_periods=7).mean())
    result["rolling_28"] = group.transform(lambda values: values.shift(1).rolling(28, min_periods=28).mean())
    result["day_of_week"] = result["date"].dt.dayofweek
    result["month_num"] = result["date"].dt.month
    return result
