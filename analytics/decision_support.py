from __future__ import annotations

import pandas as pd


def build_forecast_uplift_decision(daily: pd.DataFrame, forecast: pd.DataFrame) -> pd.DataFrame:
    """Rank product-store series where the forecast changes the recent-demand signal."""
    recent = (daily.sort_values("date").groupby(["item_id", "store_id"])
              .tail(7).groupby(["item_id", "store_id"], as_index=False)
              .agg(trailing_7_day_demand=("sales", "sum"), latest_price=("sell_price", "last")))
    expected = forecast.groupby(["item_id", "store_id"], as_index=False).agg(forecast_7_day_demand=("predicted_sales", "sum"))
    result = recent.merge(expected, on=["item_id", "store_id"], how="inner")
    result["forecast_uplift_units"] = result["forecast_7_day_demand"] - result["trailing_7_day_demand"]
    result["forecast_uplift_rate"] = result["forecast_uplift_units"] / result["trailing_7_day_demand"].replace(0, pd.NA)
    result["forecast_value_signal"] = result["forecast_7_day_demand"] * result["latest_price"]
    result["recommendation"] = result["forecast_uplift_rate"].map(lambda value: "Review rising demand" if pd.notna(value) and value > 0.10 else "Monitor")
    return result.sort_values(["recommendation", "forecast_uplift_rate", "forecast_value_signal"], ascending=[True, False, False])
