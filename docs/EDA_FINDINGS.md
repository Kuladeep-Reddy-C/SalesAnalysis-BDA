# EDA Findings

The verified sales input contains 505,032 product-day rows covering 264 products, one store, and 1,913 relative days. Total recorded demand is 492,504 units. Since only one store is present, the store comparison chart has one category and cannot support a cross-store conclusion.

The calendar covers 2011-01-29 through 2016-06-19. Calendar matching is complete. Price matching is incomplete: 96,789 sales rows have no exact store-item-week price record. Those prices are imputed using the item median, then the global median, and the count is persisted in the run summary.

## Missing-price pattern

The pipeline now preserves `is_available` before imputation and writes `results/metrics/price_availability.csv`. Unavailable price rows are concentrated near the start of item histories: 62.4% for age 0-28 days, 58.3% for age 29-90 days, 49.9% for age 91-365 days, and 11.3% after 366 days. This pattern is consistent with a product-availability or launch-history explanation, but the project will compare exclusion versus retained rows before adopting a final training policy.
Charts generated under `results/charts/` include daily sales trend, top products, store comparison, price versus sales, actual versus predicted sales, model performance, and demand spikes. The charts are descriptive; they do not establish that price or events cause demand changes.
