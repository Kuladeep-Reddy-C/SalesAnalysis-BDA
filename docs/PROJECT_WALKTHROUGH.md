# Project Walkthrough: Why, How, and Who Benefits

## 1. Purpose of This Document

This document explains the reasoning behind the project from beginning to end. It is intended to answer the questions that commonly arise during a faculty review:

- Why was this business problem selected?
- Why were these datasets and tools used?
- Why was this preprocessing necessary?
- Why was this model chosen instead of another model?
- Why is the evaluation designed this way?
- What exactly has been built?
- Who benefits from the result?
- What can the result support, and what can it not honestly claim?

The project is called **Retail Sales Forecasting and Demand Spike Detection Using PySpark**. Its implementation is presented through the `Review3` analytics pipeline and Streamlit dashboard, while the existing `Review2` Java/HBase project is preserved as the backend foundation.

---

## 2. The Project In One Paragraph

Retailers need to decide which products deserve attention before demand occurs. This project uses historical product-store-day sales, prices, and calendar information to estimate future demand for the next seven days and identify unusual demand spikes. The pipeline validates and joins the source files, creates historical features without using future information, compares a simple weekly-history baseline with a Random Forest regression model, evaluates both on a chronological holdout period, generates a recursive forecast, detects spikes using trailing demand statistics, persists the results, and presents them through a Streamlit dashboard.

The result is **demand-based decision support**, not a complete replenishment optimizer. Inventory levels, lead times, supplier constraints, service targets, and costs were not provided, so the project deliberately does not invent reorder quantities, stockout probabilities, or financial savings.

---

## 3. Why This Business Problem?

### 3.1 The business problem

A retailer usually has to make decisions before the next sales period begins:

- Which products may need closer inventory attention?
- Which products are consistently popular?
- Which products are showing an unusual increase in demand?
- How many units might be demanded in the near future?
- Can a data-driven forecast improve on simply repeating last week's demand?

If these questions are answered only by intuition, decisions may be inconsistent. If they are answered only after sales occur, the decision is too late. Forecasting creates a forward-looking signal.

### 3.2 Why a seven-day horizon?

A seven-day horizon is useful because it is:

1. Short enough to be operationally relevant.
2. Long enough to support a weekly planning cycle.
3. Compatible with the dataset's weekly demand patterns.
4. Easy to explain during an academic demonstration.
5. Suitable for comparing against the demand from seven days earlier.

The seven-day horizon is a practical project choice, not a claim that every retailer plans on exactly seven days.

### 3.3 Why include demand-spike detection?

A forecast gives an expected future value. Anomaly detection answers a different question: **when did demand behave unusually compared with the product's own history?**

This distinction matters because a product can be popular every day without being anomalous. A high-volume product should not automatically be labelled a spike. The project therefore compares each product-store pair with its own trailing mean and standard deviation.

---

## 4. Who Benefits From This Project?

### 4.1 Inventory and operations teams

They receive a ranked demand signal that can help them decide which product-store combinations deserve review first. The output can support a human planning workflow before it is connected to actual stock and replenishment systems.

### 4.2 Retail analysts

They receive reusable data-quality reports, exploratory charts, model metrics, predictions, and spike records instead of needing to inspect raw CSV files manually.

### 4.3 Data engineers

They can see how source files, HBase loaders, validation, joins, feature generation, persisted outputs, and a dashboard fit into one pipeline. The project also demonstrates why join cardinality and source traceability matter.

### 4.4 Data science and machine learning students

They can explain a baseline, feature engineering, time-aware validation, Random Forest regression, metrics, recursive forecasting, and anomaly detection using a concrete dataset.

### 4.5 Faculty and reviewers

They can evaluate the entire analytics lifecycle: business question, data preparation, distributed-processing design, EDA, model choice, evidence-based decision, performance measurement, and presentation.

### 4.6 What this project does not replace

It does not replace an enterprise inventory management system. It does not know current stock, open purchase orders, supplier lead times, warehouse capacity, or service-level policies. Those would be required before turning a forecast into an automated order quantity.

---

## 5. What Data Was Used and Why?

The project uses the existing processed CSV exports in `Review2` because they are local, reproducible, and already connected to the existing Java/HBase work.

### 5.1 Sales data

File: `Review2/sales_processed_clean.csv`

Columns:

- `id`: source product-store series identifier
- `item_id`: product identifier
- `dept_id`: department identifier
- `cat_id`: category identifier
- `store_id`: store identifier
- `state_id`: state identifier
- `d`: relative calendar day such as `d_1`
- `sales`: units sold, used as the prediction target

**Why use sales as the target?** The business decision concerns demand. In this dataset, the available demand measure is daily unit sales, so it is more appropriate than predicting revenue or price.

### 5.2 Price data

File: `Review2/prices_processed_clean.csv`

Columns:

- `store_id`
- `item_id`
- `wm_yr_wk`: retail week key
- `sell_price`

**Why include price?** Price can be associated with demand. The model uses it as a predictive context variable, but the project does not claim that the model proves a causal price effect.

### 5.3 Calendar data

File: `Review2/calendar_processed_clean.csv`

It contains the mapping from relative day to actual date, week, weekday, month, year, event fields, and SNAP indicators.

**Why include calendar data?** Demand can vary by weekday, month, season, and event context. Calendar data also converts the relative `d_1` style key into a real date required for chronological analysis.

### 5.4 Verified dataset facts

The audit found:

- 505,032 sales rows
- 204,234 price rows
- 1,969 calendar rows
- 264 products in sales
- 1 store and 1 state in the sales data
- 1,913 relative sales days
- Calendar coverage from 2011-01-29 to 2016-06-19
- 0 malformed numeric sales or prices
- 0 negative sales or prices
- 0 duplicate natural keys in the audited files

The one-store structure is important. The dashboard contains a store comparison section because it is part of the analytical workflow, but the project does not claim meaningful cross-store findings from one store.

---

## 6. Why Use CSV First and Keep HBase?

The existing project already contains Java loaders for three HBase tables:

- `retail_sales`
- `retail_prices`
- `retail_calendar`

HBase is valuable as a NoSQL backend because it can store wide, sparse records indexed by row key. It also demonstrates an important Big Data architecture concept: an operational or serving store can be separate from the analytics processing layer.

However, the first reproducible analytics run uses the CSV exports. This choice was made because:

1. The CSV schemas can be inspected directly.
2. The pipeline can be rerun without changing HBase state.
3. The input files are versionable and easy for a student to explain.
4. The HBase service and ZooKeeper descriptors were not reachable during the audit.
5. The project must not claim a successful HBase read without verifying it.

The result is an honest architecture: **HBase remains available as the existing backend, while the tested run explicitly uses CSV input.** No HBase table is deleted or modified by Review3.

---

## 7. Why This Preprocessing?

Preprocessing is not just formatting. It protects the validity of every later chart and metric.

### 7.1 Schema validation

The pipeline checks that each input contains the required columns before performing transformations.

**Why?** A missing or renamed column should produce an actionable error instead of a partially wrong result.

### 7.2 Type validation

Sales and prices are converted using strict numeric parsing. Dates are parsed using date-aware conversion.

**Why?** A text value such as `unknown` must not silently become zero. Silent conversion can corrupt model training while appearing successful.

### 7.3 Non-negative validation

Sales and selling prices are checked for negative values.

**Why?** Negative values may be legitimate in some systems when returns are represented explicitly, but this source is being interpreted as unit demand and selling price. An unexpected negative value should therefore be investigated rather than accepted silently.

### 7.4 Duplicate checks

The pipeline checks natural keys:

- Sales: `id + d`
- Prices: `store_id + item_id + wm_yr_wk`
- Calendar: `d`

**Why?** Duplicate dimension rows can multiply records during a join and produce inflated demand. The project reports duplicates rather than blindly deleting observations.

### 7.5 Many-to-one join validation

Sales joins calendar on `d`. Sales then joins prices on `store_id`, `item_id`, and `wm_yr_wk`. The joins are validated as many-to-one.

**Why?** A product-day sales record should match at most one calendar row and one price row for the selected key. This protects the daily product-store grain from accidental many-to-many multiplication.

### 7.6 Missing price handling

The sales-to-calendar join matched all rows. The sales-to-price join left 96,789 rows without an exact price record. The pipeline fills missing prices with the product median and then the overall median, while retaining the unmatched count in the run summary.

**Why impute instead of dropping?** Dropping those sales would discard demand observations and bias the training data. Median imputation is simple, robust to outliers, and visible in the quality report. It is still a limitation, not proof that the imputed price was the actual price.

### 7.7 Why aggregate at product-store-day grain?

The prediction question is daily demand for a product at a store. The source sales file already represents this grain for the available data.

**Why?** Features such as yesterday's demand and demand seven days ago only make sense when the observations are consistently ordered at the same product-store-day level.

---

## 8. Why These EDA Views?

EDA is used to understand the data before making a model or decision.

### Daily total sales trend

**Why?** It reveals broad changes over time, gaps, seasonality, and unusual periods.

### Top products

**Why?** It identifies which products contribute the most units and helps the reviewer connect model outputs to operational priorities.

### Store comparison

**Why?** Store comparisons are useful in a multi-store dataset. In this actual dataset there is only one store, so the chart also exposes a data limitation rather than hiding it.

### Price versus sales

**Why?** It provides a descriptive view of the relationship between price and units sold. It is not interpreted as causal evidence because other factors may change at the same time.

### Actual versus predicted sales

**Why?** A table of metrics is important, but the plot shows whether predictions follow the timing and shape of actual demand. The dashboard also shows horizon-wise rolling-origin error, residuals, and feature importance.

### Model performance comparison

**Why?** It makes the baseline-versus-model decision visible and prevents selecting a model based only on complexity.

### Demand-spike visualisation

**Why?** It connects anomaly scores to dates and demand patterns, making the method explainable to a non-specialist reviewer.

---

## 9. Why These Features?

The feature set is deliberately understandable and based on information that would be available when making a forecast.

### `lag_1`

Yesterday's demand captures short-term momentum.

### `lag_7`

Demand seven days earlier captures weekly repetition and is also the baseline prediction.

### `lag_28`

Demand 28 days earlier captures a longer monthly-like cycle.

### `rolling_7`

The mean of the previous seven demand values smooths daily noise.

### `rolling_28`

The mean of the previous 28 demand values gives a broader local demand level.

### `sell_price`

Price provides product context that may help explain changes in demand.

### `day_of_week` and `month_num`

These represent calendar seasonality in a simple form.

### `is_event`

This indicates whether a calendar event is present. It is a compact representation of event context without pretending that every event has the same effect.

### Why exclude the current day from rolling windows?

When predicting a day's demand, that day's actual sales are not yet known. Every rolling feature uses a one-day shift before calculating the window.

For example, the rolling seven-day feature for Tuesday uses the previous seven observations and does not include Tuesday's target. This prevents target leakage.

### Why not use every possible feature?

More features do not automatically mean a better model. The selected features are explainable, available in the source data, and directly connected to the forecasting question. A future version could add richer event encoding, category-level aggregates, promotions, stock information, or weather if those fields were available.

---

## 10. Why Use a Historical Baseline?

The baseline predicts demand using the same product-store pair's sales from seven days earlier.

This baseline is intentionally simple. It answers:

> Does the machine learning model improve on a reasonable, transparent weekly repetition rule?

A baseline is necessary because a Random Forest can produce an impressive-looking prediction while still being no better than a simple operational rule. If the model cannot beat the baseline on the same test dates, its additional complexity may not be justified.

The baseline is also easy to explain to a faculty reviewer and easy for an operations team to reproduce.

---

## 11. Why Choose Random Forest Regression?

### 11.1 Why regression?

The target is a numeric quantity: units sold. Regression is therefore the suitable supervised learning problem type.

### 11.2 Why Random Forest?

Random Forest was selected because it is a strong, explainable first model for this dataset:

1. It can model nonlinear relationships.
2. It can combine lag, rolling, price, weekday, month, and event signals.
3. It does not require the analyst to specify a linear relationship between price and demand.
4. It is less sensitive to feature scaling than distance-based models.
5. It is relatively straightforward to explain in an academic review.
6. It provides a useful comparison against the historical baseline without requiring a complex deep-learning stack.
7. A fixed random seed makes the run more reproducible.

### 11.3 Why not choose deep learning first?

A neural network could be considered later, but it would add complexity, tuning requirements, and explanation difficulty. The current dataset has one store and the project goal is to demonstrate a complete, defensible pipeline. A tree ensemble gives a strong practical comparison without making the project harder to audit.

### 11.4 Why not use a pure time-series model first?

Models such as ARIMA or exponential smoothing are valid alternatives, but the project needs to combine multiple tabular signals: price, calendar attributes, events, and multiple lag windows. Random Forest fits this mixed-feature design directly. A future study could compare it with seasonal naive, ETS, ARIMA, gradient boosting, or a dedicated global forecasting model.

### 11.5 Why clip negative predictions?

Unit demand cannot be negative. The model output is therefore clipped at zero before it is presented as demand.

This is a domain constraint, not a claim that the model has learned a perfect non-negative distribution.

---

## 12. Why Split the Data Chronologically?

The data represents time. Future observations must not influence the past.

The project uses:

- **Training:** 2011-02-26 through 2016-02-28, 482,856 rows
- **Validation:** 2016-02-29 through 2016-03-27, 7,392 rows
- **Test:** 2016-03-28 through 2016-04-24, 7,392 rows

The first available training date is later than the raw calendar because at least 28 historical days are required for the longest lag and rolling window.

### Why not randomly split the rows?

Random splitting can place later observations in training and earlier observations in testing. For time-series data, that can give the model access to patterns that would not be available at the real prediction time. A chronological split better represents deployment.

### Why evaluate both models on the same test rows?

The comparison must be fair. Both the baseline and Random Forest are measured on the same product-day observations and the same dates.

---

## 13. Why These Metrics?

### MAE: Mean Absolute Error

MAE is the average absolute difference between actual and predicted units.

**Why use it?** It is expressed in the target's unit, so it is easy to explain: the average prediction error is approximately this many units.

### RMSE: Root Mean Squared Error

RMSE gives larger errors more weight.

**Why use it?** Large misses may be especially important for inventory planning. RMSE makes those misses visible.

### WAPE: Weighted Absolute Percentage Error

The project defines WAPE as:

```text
sum(abs(actual - prediction)) / sum(abs(actual))
```

**Why use it?** It expresses total error relative to total demand and is useful when many product-day rows have small values.

If total actual demand is zero, WAPE is reported as undefined rather than dividing by zero or inventing a value.

### Measured result

| Model | MAE | RMSE | WAPE |
|---|---:|---:|---:|
| Historical baseline | 1.3281 | 3.3600 | 1.1182 |
| Random Forest | 1.0699 | 2.4246 | 0.9009 |

The Random Forest improved against the baseline by approximately:

- 19.4% in MAE
- 27.8% in RMSE
- 19.4% in WAPE

Because these numbers come from the measured test output, the project can defend the model choice without claiming that Random Forest is universally best.

---

## 14. Why Make a Recursive Seven-Day Forecast?

A one-row prediction for a future day is not enough when the model uses lagged demand. For the second future day, the first future day's actual sales are unavailable.

The project therefore uses recursive forecasting:

1. Predict the first future day using historical lags.
2. Append that prediction to the temporary history.
3. Use the generated value as a lag when predicting the next day.
4. Repeat for the forecast horizon.

### Why is this important?

It prevents the project from using unavailable future actual sales. Reusing actual future sales would make the forecast look better than a real deployment could achieve.

### Forecast limitation

Future price records are not fully available. The demonstration forecast uses the latest known product-store price. This makes the forecast reproducible, but future price planning should be improved when a reliable price schedule is available.

---

## 15. Why Detect Spikes With a Trailing Mean and Standard Deviation?

The spike detector calculates, for each product-store series:

- A trailing historical mean from the previous 28 observations
- A trailing historical standard deviation
- A one-sided Poisson upper-tail probability based on the trailing demand rate

An observation is flagged when its Poisson upper-tail probability is at most 0.01, expected demand is at least one unit, and actual demand is above the trailing rate.

### Why use a product's own history?

A single global threshold would confuse popularity with unusual behaviour. A high-volume product may be normal for itself, while a low-volume product may be unusual after a sharp increase.

### Why require history?

The detector waits until enough previous observations exist. A spike decision based on only one or two prior days would be unstable and difficult to defend.

### Why make the rule transparent?

A reviewer or business user can inspect the actual demand, expected demand, standard deviation, score, and reason. The method is easier to explain than an opaque anomaly score.

---

## 16. Why Use PySpark in the Project Design?

The project is a Big Data Analytics case study, so PySpark is included for distributed DataFrame processing and Spark ML compatibility.

The intended Spark responsibilities are:

- Reading large CSV inputs
- Validating and transforming columns
- Joining sales, prices, and calendar data
- Aggregating demand
- Building time-aware features
- Scaling to larger inputs or more stores
- Using Spark MLlib where the runtime is configured for it

The project supports two explicit paths. The reference path uses Pandas for quick local iteration; `run_pipeline.py --engine spark` runs the real Spark DataFrame, window, and Spark MLlib path. The verified Spark run processed the full available slice locally with Spark 3.5.9 and Java 17. It is a local Spark run, not a multi-node benchmark.

### Why not claim distributed processing anyway?

A project should not call local execution a cluster benchmark. The current results are valid local measurements, but they do not prove multi-node speedup. A future Spark run should report Spark version, master URL, partitions, executor resources, input size, and runtime under the same workload.

---

## 17. Why Use Streamlit?

Streamlit was chosen because it turns persisted Python analytics outputs into an interactive demonstration with little frontend overhead.

The dashboard is useful because a reviewer can:

- See the source and execution mode
- Inspect total sales, product count, store count, and date coverage
- Select a product
- View actual versus predicted demand
- Inspect the seven-day forecast
- Filter or inspect demand-spike records
- Compare baseline and Random Forest metrics
- Read the demand-based inventory recommendation

### Why does the dashboard not retrain on every refresh?

Training is expensive and should be separated from presentation. The pipeline generates outputs once, and the dashboard reads those persisted outputs. This makes the interface responsive and prevents accidental repeated training.

### How does the backend connect to storage?

FastAPI provides the application boundary. Its backend selector attempts the HBase Thrift adapter when `SERVING_BACKEND=hbase` or `auto` is configured, and reports the active backend through `/backend-status`. HBase serving uses new `retail_forecasts` and `retail_spikes` tables with row keys in the form `item_id#store_id#yyyy-mm-dd`; existing source tables are never changed. When HBase is unavailable, the verified local SQLite serving store provides the same forecast, spike, decision, and metric reads. The current machine uses SQLite because ZooKeeper/HBase Thrift is unavailable.

---

## 18. What Happens From Start to End?

### Step 1: Inspect and audit

The project first inspects schemas, row counts, keys, file sizes, available runtimes, and HBase status.

**Why first?** Every implementation decision depends on what the data actually contains.

### Step 2: Read the three inputs

Sales, prices, and calendar data are loaded from the verified Review2 paths.

**Why?** The pipeline remains reproducible and does not depend on an unverified live backend connection.

### Step 3: Validate the inputs

Required columns, types, non-negative values, nulls, and duplicates are checked.

**Why?** Invalid inputs must be visible before modeling.

### Step 4: Join the inputs

Sales are joined to calendar and price dimensions using verified keys.

**Why?** The model needs actual dates, week context, events, and price information.

### Step 5: Build the daily feature table

Historical lags and rolling means are calculated per item and store, ordered by date.

**Why?** The model needs past demand signals while avoiding leakage.

### Step 6: Create chronological splits

Training, validation, and test dates are separated in time.

**Why?** This approximates how the model would be used in the future.

### Step 7: Train the baseline and Random Forest

The baseline uses lag seven. The Random Forest learns from all selected features.

**Why?** The baseline establishes a minimum useful standard, while the model tests whether extra context adds value.

### Step 8: Evaluate

MAE, RMSE, and WAPE are calculated on the same test period.

**Why?** The selected model must be justified by measured performance.

### Step 9: Generate forecasts and spikes

The selected model generates recursive future demand, while the spike detector produces inspectable anomaly rows.

**Why?** Forecasting supports future planning; spike detection highlights unusual historical behaviour.

### Step 10: Persist outputs

CSV, JSON, PNG, and model files are written under `results/` and `models/`.

**Why?** Persisted outputs make the run auditable and allow the dashboard to remain separate from training.

### Step 11: Present the decision

Streamlit presents the evidence and a rule-based demand-prioritisation recommendation.

**Why?** Analytics becomes useful when a human can understand what action the evidence supports.

---

## 19. What Decision Does the Project Support?

The expanded benchmark and rolling-origin evaluation show a nuanced result: the 28-day moving average is strongest on the single-window benchmark, while Random Forest is stronger at rolling horizons 1-4 and weaker at horizons 5-7. Across four origins, the forecast-uplift top decile had positive realised uplift in three origins, but rank correlations were low. The dashboard therefore uses forecast uplift as a review signal rather than assuming that Random Forest always wins. The supported decision is:

> Use the Random Forest forecast and spike outputs to prioritise which product-store combinations should receive inventory review first.

The recommendation is intentionally phrased as prioritisation, not automatic replenishment. A true order decision would additionally need:

- Current inventory
- Inventory already in transit
- Supplier lead time
- Minimum order quantity
- Safety stock policy
- Desired service level
- Product cost and margin
- Warehouse and shelf capacity

Without those fields, producing a precise order quantity would be fabricated.

---

## 20. Limitations and Future Improvements

### Current limitations

1. The source dataset is historical, not live real-time data.
2. The dataset contains one store, so cross-store conclusions are unavailable.
3. 96,789 sales rows lack an exact price match and require documented imputation.
4. The HBase service could not be verified during the audit because ZooKeeper timed out; SQLite is the verified local serving alternative.
5. The Spark run is local `local[*]`, not a measured multi-node cluster run.
6. The recursive forecast uses the latest known price where future prices are unavailable.
7. The forecast is evaluated on a historical holdout, but it is not a guarantee of future reliability.
8. The recommendation does not use actual inventory or supply constraints.

### Future improvements

1. Add Spark/Pandas feature-parity fixtures and formal rolling no-leakage tests.
2. Add a safe HBase serving adapter once the service is available, without changing existing source tables.
3. Add refresh-from-API behavior to the dashboard while retaining the direct-file fallback.
4. Add richer event, category, promotion, and price-change features.
5. Compare Random Forest with seasonal naive, gradient boosting, and dedicated time-series models.
6. Evaluate rolling-origin backtests across multiple historical test windows.
7. Add prediction intervals rather than only point forecasts.
8. Add inventory-aware recommendations once stock and lead-time data becomes available.
9. Benchmark local and Spark execution using identical input sizes and documented settings.
10. Add model monitoring for drift, missing data, and forecast error after deployment.

---

## 21. Final Explanation for a Faculty Review

A concise final explanation is:

> We selected retail demand forecasting because inventory decisions must be made before future sales occur. We audited the existing sales, price, and calendar files instead of guessing their schemas. We validated keys and joins because bad joins can multiply demand records. We created lag and rolling features because past demand is the most direct signal available, and we shifted rolling windows to prevent current-target leakage. We compared seven baselines before judging Random Forest. The measured result is nuanced: the 28-day moving average is strongest on the single-window daily benchmark, while Random Forest is better at rolling horizons 1-4 and weaker at horizons 5-7. A four-origin decision backtest found positive realised uplift for forecast-ranked top deciles in three origins, but low rank correlations, so the output is a review signal rather than a validated replenishment policy. We then generated a recursive seven-day forecast and count-aware spike records, persisted all outputs, exposed them through the API, and presented them through Streamlit. We do not automate ordering without inventory and supply data.

That explanation connects the business problem, engineering choices, machine learning choice, measured evidence, user interface, and responsible limitation handling in one story.
