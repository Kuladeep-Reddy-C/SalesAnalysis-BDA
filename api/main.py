from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, Query

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"
app = FastAPI(title="Retail Demand Lab API", version="1.0")


def read_csv(name: str) -> pd.DataFrame:
    path = RESULTS / name
    if not path.exists():
        raise HTTPException(status_code=503, detail=f"Analytics output not found: {name}")
    return pd.read_csv(path)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "source": "persisted Review3 analytics outputs"}


@app.get("/metrics")
def metrics() -> list[dict]:
    return read_csv("metrics/model_metrics.csv").to_dict(orient="records")


@app.get("/forecast/{item_id}")
def forecast(item_id: str, store_id: str | None = None) -> list[dict]:
    frame = read_csv("predictions/seven_day_forecast.csv")
    frame = frame[frame["item_id"] == item_id]
    if store_id:
        frame = frame[frame["store_id"] == store_id]
    if frame.empty:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return frame.to_dict(orient="records")


@app.get("/spikes")
def spikes(limit: int = Query(100, ge=1, le=1000)) -> list[dict]:
    return read_csv("predictions/demand_spikes.csv").head(limit).to_dict(orient="records")


@app.get("/decisions")
def decisions(limit: int = Query(100, ge=1, le=1000)) -> list[dict]:
    return read_csv("metrics/forecast_uplift_decision.csv").head(limit).to_dict(orient="records")


@app.get("/run-summary")
def run_summary() -> dict:
    path = RESULTS / "metrics" / "run_summary.json"
    if not path.exists():
        raise HTTPException(status_code=503, detail="Run summary not found")
    return json.loads(path.read_text())
