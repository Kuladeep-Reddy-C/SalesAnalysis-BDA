from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
    root: Path = Path(__file__).resolve().parent
    input_root: Path = Path(__file__).resolve().parent.parent / "Review2"
    results: Path = Path(__file__).resolve().parent / "results"
    models: Path = Path(__file__).resolve().parent / "models"
    test_days: int = 28
    validation_days: int = 28
    random_seed: int = 42

    @property
    def sales_path(self) -> Path:
        return self.input_root / "sales_processed_clean.csv"

    @property
    def prices_path(self) -> Path:
        return self.input_root / "prices_processed_clean.csv"

    @property
    def calendar_path(self) -> Path:
        return self.input_root / "calendar_processed_clean.csv"

    def prepare(self) -> None:
        for path in (self.results / "charts", self.results / "metrics", self.results / "predictions", self.models):
            path.mkdir(parents=True, exist_ok=True)
