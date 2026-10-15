from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from api.backend import ServingBackend

ROOT = Path(__file__).resolve().parents[1]
RESULTS = ROOT / "results"
app = FastAPI(title="Retail Demand Lab API", version="1.0")
backend = ServingBackend(RESULTS)


def read_csv(name: str) -> pd.DataFrame:
    path = RESULTS / name
    if not path.exists():
        raise HTTPException(status_code=503, detail=f"Analytics output not found: {name}")
    return pd.read_csv(path)


@app.get("/health")
def health() -> dict:
    status = backend.status()
    return {"status": "ok", "source": "serving backend", **status}


@app.get("/metrics")
def metrics() -> list[dict]:
    try:
        return backend.metrics()
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/forecast/{item_id}")
def forecast(item_id: str, store_id: str | None = None) -> list[dict]:
    try:
        records = backend.forecasts(item_id, store_id)
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if not records:
        raise HTTPException(status_code=404, detail="Forecast not found")
    return records


@app.get("/spikes")
def spikes(limit: int = Query(100, ge=1, le=1000)) -> list[dict]:
    try:
        return backend.spikes(limit)
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/decisions")
def decisions(limit: int = Query(100, ge=1, le=1000)) -> list[dict]:
    try:
        return backend.decisions(limit)
    except (FileNotFoundError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/backend-status")
def backend_status() -> dict:
    return backend.status()


@app.get("/run-summary")
def run_summary() -> dict:
    path = RESULTS / "metrics" / "run_summary.json"
    if not path.exists():
        raise HTTPException(status_code=503, detail="Run summary not found")
    return json.loads(path.read_text())
