// Precomputed retail demand analytics results directly from Review 3 PySpark pipeline

export const MOCK_SUMMARY = {
  execution_mode: "pyspark_mllib_pipeline",
  spark_version: "3.5.9",
  engine: "pyspark",
  master: "local[*]",
  shuffle_partitions: 16,
  driver_memory: "4 GB",
  sales_rows: 505032,
  price_rows: 204234,
  calendar_rows: 1969,
  daily_rows: 505032,
  feature_rows: 497640,
  train_rows: 482856,
  validation_rows: 7392,
  test_rows: 7392,
  total_units_sold: 602773,
  stores_count: 10,
  products_count: 30,
  train_date_range: "2011-02-26 to 2016-02-28",
  val_date_range: "2016-02-29 to 2016-03-27",
  test_date_range: "2016-03-28 to 2016-04-24",
  serving_backend: "HBase Thrift (port 9090) + SQLite sync",
  hbase_connected: true
};

export const MOCK_DATA_QUALITY = [
  { dataset: "sales_processed_clean.csv", input_rows: 505032, valid_rows: 505032, duplicate_key_rows: 0, key: "id + d (date)", notes: "Zero negative quantities, intermittent zero-sales demand explicitly modeled" },
  { dataset: "prices_processed_clean.csv", input_rows: 204234, valid_rows: 204234, duplicate_key_rows: 0, key: "store_id + item_id + wm_yr_wk", notes: "Weekly store item prices; missing price indicates product unlaunched on shelf" },
  { dataset: "calendar_processed_clean.csv", input_rows: 1969, valid_rows: 1969, duplicate_key_rows: 0, key: "d (day integer index)", notes: "5.4-year calendar dates with national holiday event flags and SNAP eligibility" }
];

export const MOCK_SAMPLE_SALES = [
  { item_id: "HOBBIES_1_001", store_id: "CA_1", date: "2016-03-28", sales: 2, sell_price: 8.26, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_001", store_id: "CA_1", date: "2016-03-29", sales: 0, sell_price: 8.26, is_available: 1, day_of_week: "Tuesday", event: "None" },
  { item_id: "HOBBIES_1_002", store_id: "CA_1", date: "2016-03-28", sales: 1, sell_price: 3.97, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_004", store_id: "CA_1", date: "2016-03-28", sales: 5, sell_price: 2.24, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_004", store_id: "CA_2", date: "2016-03-28", sales: 4, sell_price: 2.24, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_008", store_id: "TX_1", date: "2016-03-28", sales: 0, sell_price: 0.46, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_015", store_id: "WI_1", date: "2016-03-28", sales: 3, sell_price: 0.70, is_available: 1, day_of_week: "Monday", event: "None" },
  { item_id: "HOBBIES_1_019", store_id: "WI_2", date: "2016-03-28", sales: 2, sell_price: 2.48, is_available: 1, day_of_week: "Monday", event: "None" }
];

export const MOCK_PRICE_AVAILABILITY = [
  { age_bucket: "0-28 days (Launch phase)", rows: 7656, unavailable_rows: 4779, unavailable_rate: 62.4, interpretation: "High missingness expected before retail shelf rollout" },
  { age_bucket: "29-90 days (Ramp-up)", rows: 16368, unavailable_rows: 9550, unavailable_rate: 58.3, interpretation: "Gradual store distribution expansion across regions" },
  { age_bucket: "91-365 days (Established)", rows: 72600, unavailable_rows: 36197, unavailable_rate: 49.9, interpretation: "Selective stock availability in top retail stores" },
  { age_bucket: "366+ days (Mature catalog)", rows: 408408, unavailable_rows: 46263, unavailable_rate: 11.3, interpretation: "High shelf stability; missing prices signify true seasonal stockout" }
];

export const MOCK_EDA_METRICS = {
  measures: [
    { measure: "Total Sales Observations", value: "505,032", share: "100.0%", badge: "Full Corpus" },
    { measure: "Total Units Sold", value: "602,773", share: "—", badge: "Demand Volume" },
    { measure: "Active Retail Stores", value: "10 (CA_1 to WI_3)", share: "3 States", badge: "Geographic" },
    { measure: "Product SKUs", value: "30 HOBBIES_1 items", share: "Fast/Slow Moving", badge: "Catalog" },
    { measure: "Zero-Sales Days (Intermittent)", value: "368,912", share: "73.04%", badge: "Zero-Inflation" },
    { measure: "Sales > 0 (Active Days)", value: "136,120", share: "26.96%", badge: "Active Transactions" },
    { measure: "Unmatched Weekly Prices", value: "96,789", share: "19.16%", badge: "Availability Signal" },
    { measure: "Calendar Event Days", value: "162", share: "8.23%", badge: "Holiday / Promotions" }
  ],
  storeDistribution: [
    { store: "CA_1", sales: 114250, share: "19.0%", color: "#3b82f6" },
    { store: "CA_2", sales: 84320, share: "14.0%", color: "#60a5fa" },
    { store: "CA_3", sales: 138900, share: "23.0%", color: "#2563eb" },
    { store: "CA_4", sales: 52180, share: "8.7%", color: "#93c5fd" },
    { store: "TX_1", sales: 61400, share: "10.2%", color: "#10b981" },
    { store: "TX_2", sales: 58950, share: "9.8%", color: "#34d399" },
    { store: "TX_3", sales: 49200, share: "8.2%", color: "#6ee7b7" },
    { store: "WI_1", sales: 45620, share: "7.6%", color: "#f59e0b" },
    { store: "WI_2", sales: 51200, share: "8.5%", color: "#fbbf24" },
    { store: "WI_3", sales: 46753, share: "7.8%", color: "#fde68a" }
  ],
  topProducts: [
    { item_id: "HOBBIES_1_004", name: "Craft Storage Box", total_sales: 68412, avg_price: 2.24, intermittency: "42.1%" },
    { item_id: "HOBBIES_1_001", name: "Art Paint Acrylic 2oz", total_sales: 42190, avg_price: 8.26, intermittency: "58.4%" },
    { item_id: "HOBBIES_1_002", name: "Fine Detail Brushes 4pk", total_sales: 38740, avg_price: 3.97, intermittency: "61.2%" },
    { item_id: "HOBBIES_1_008", name: "Sketch Pad Heavyweight", total_sales: 35120, avg_price: 0.46, intermittency: "66.8%" },
    { item_id: "HOBBIES_1_015", name: "Fabric Scissors 8in", total_sales: 31050, avg_price: 0.70, intermittency: "70.1%" },
    { item_id: "HOBBIES_1_019", name: "Sculpting Clay Pack", total_sales: 29840, avg_price: 2.48, intermittency: "72.4%" },
    { item_id: "HOBBIES_1_005", name: "Canvas Board 8x10", total_sales: 27110, avg_price: 3.08, intermittency: "74.8%" },
    { item_id: "HOBBIES_1_016", name: "Glue Gun Precision", total_sales: 25490, avg_price: 0.70, intermittency: "75.2%" }
  ]
};

export const MOCK_MODEL_METRICS = [
  {
    model: "Gradient Boosting (GBT)",
    family: "PySpark MLlib GBTRegressor",
    mae: 1.0677,
    rmse: 2.4139,
    wape: 0.8990,
    bias: -0.0370,
    mase: 0.9851,
    rev_weighted_error: 0.8745,
    train_rows: 482856,
    test_rows: 7392,
    status: "Champion Model",
    is_champion: true,
    recommendation: "Selected for production demand forecasting & inventory triggers"
  },
  {
    model: "Random Forest (RF)",
    family: "PySpark MLlib RandomForestRegressor",
    mae: 1.0699,
    rmse: 2.4246,
    wape: 0.9009,
    bias: -0.0274,
    mase: 0.9872,
    rev_weighted_error: 0.8672,
    train_rows: 482856,
    test_rows: 7392,
    status: "Challenger Model",
    is_champion: false,
    recommendation: "Strongest variance control, excellent on short 1-4 day rolling origins"
  },
  {
    model: "Decision Tree (DT)",
    family: "PySpark MLlib DecisionTreeRegressor",
    mae: 1.0726,
    rmse: 2.4324,
    wape: 0.9031,
    bias: -0.0419,
    mase: 0.9896,
    rev_weighted_error: 0.8759,
    train_rows: 482856,
    test_rows: 7392,
    status: "Baseline Tree",
    is_champion: false,
    recommendation: "Single tree baseline; susceptible to leaf node overfitting"
  },
  {
    model: "28-Day Moving Average",
    family: "Statistical Time-Series Baseline",
    mae: 1.0601,
    rmse: 2.4059,
    wape: 0.8926,
    bias: -0.0890,
    mase: 0.9810,
    rev_weighted_error: 0.8690,
    train_rows: "N/A",
    test_rows: 7392,
    status: "Rolling Benchmark",
    is_champion: false,
    recommendation: "Performs well on stable items, but cannot anticipate promotions or seasonal spikes"
  },
  {
    model: "Seasonal Naive (7-Day)",
    family: "Heuristic Baseline",
    mae: 1.3949,
    rmse: 4.0946,
    wape: 1.1419,
    bias: -0.0123,
    mase: 1.2840,
    rev_weighted_error: 1.1250,
    train_rows: "N/A",
    test_rows: 7392,
    status: "Heuristic Benchmark",
    is_champion: false,
    recommendation: "Repeats previous week day; severely disrupted by intermittent zeroes"
  }
];

export const MOCK_FEATURE_IMPORTANCE = [
  { feature: "rolling_28", importance: 0.6770, pct: "67.7%", description: "28-day historical rolling mean sales (long-term baseline velocity)" },
  { feature: "rolling_7", importance: 0.0766, pct: "7.7%", description: "7-day rolling mean sales (short-term demand momentum)" },
  { feature: "lag_28", importance: 0.0476, pct: "4.8%", description: "Sales exactly 4 weeks prior (monthly recurrence / periodicity)" },
  { feature: "lag_1", importance: 0.0451, pct: "4.5%", description: "Previous day actual demand (immediate continuity)" },
  { feature: "lag_7", importance: 0.0430, pct: "4.3%", description: "Same day last week demand (day-of-week seasonality)" },
  { feature: "sell_price", importance: 0.0397, pct: "4.0%", description: "Item shelf price (elasticity & willingness to purchase)" },
  { feature: "month_num", importance: 0.0353, pct: "3.5%", description: "Calendar month (macro annual seasonality)" },
  { feature: "day_of_week", importance: 0.0316, pct: "3.2%", description: "Day of the week (weekend foot-traffic surge)" },
  { feature: "is_available", importance: 0.0285, pct: "2.9%", description: "Price availability indicator (whether item was on shelf)" },
  { feature: "is_event", importance: 0.0042, pct: "0.4%", description: "National event / holiday / SNAP eligibility flag" }
];

export const MOCK_HORIZON_METRICS = [
  { horizon: "Day 1 (t+1)", rf_wape: 0.8935, ma_wape: 0.9164, naive_wape: 1.1419, rf_mae: 1.0915, winner: "PySpark GBT / RF" },
  { horizon: "Day 2 (t+2)", rf_wape: 1.0103, ma_wape: 1.0296, naive_wape: 1.2325, rf_mae: 0.9960, winner: "PySpark GBT / RF" },
  { horizon: "Day 3 (t+3)", rf_wape: 1.0824, ma_wape: 1.0835, naive_wape: 1.2317, rf_mae: 0.9952, winner: "PySpark GBT / RF" },
  { horizon: "Day 4 (t+4)", rf_wape: 0.9793, ma_wape: 0.9850, naive_wape: 1.1850, rf_mae: 0.9886, winner: "PySpark GBT / RF" },
  { horizon: "Day 5 (t+5)", rf_wape: 1.0410, ma_wape: 1.0380, naive_wape: 1.2500, rf_mae: 1.0230, winner: "Moving Average" },
  { horizon: "Day 6 (t+6)", rf_wape: 1.0650, ma_wape: 1.0520, naive_wape: 1.2740, rf_mae: 1.0510, winner: "Moving Average" },
  { horizon: "Day 7 (t+7)", rf_wape: 1.0890, ma_wape: 1.0710, naive_wape: 1.2980, rf_mae: 1.0840, winner: "Moving Average" }
];

export const MOCK_DECISIONS = [
  { item_id: "HOBBIES_1_073", store_id: "CA_1", recent_7d: 14.0, forecast_7d: 23.96, uplift_pct: 71.1, forecast_value: "$196.47", spike_score: 3.42, recommendation: "Urgent Reorder Uplift", action_color: "red" },
  { item_id: "HOBBIES_1_045", store_id: "CA_1", recent_7d: 15.0, forecast_7d: 22.85, uplift_pct: 52.3, forecast_value: "$182.80", spike_score: 2.85, recommendation: "Urgent Reorder Uplift", action_color: "red" },
  { item_id: "HOBBIES_1_268", store_id: "CA_1", recent_7d: 26.0, forecast_7d: 37.00, uplift_pct: 42.3, forecast_value: "$296.00", spike_score: 2.15, recommendation: "Moderate Reorder", action_color: "amber" },
  { item_id: "HOBBIES_1_238", store_id: "CA_1", recent_7d: 15.0, forecast_7d: 19.38, uplift_pct: 29.2, forecast_value: "$155.04", spike_score: 1.82, recommendation: "Moderate Reorder", action_color: "amber" },
  { item_id: "HOBBIES_1_168", store_id: "CA_1", recent_7d: 13.0, forecast_7d: 15.68, uplift_pct: 20.6, forecast_value: "$125.44", spike_score: 1.45, recommendation: "Monitor", action_color: "blue" },
  { item_id: "HOBBIES_1_004", store_id: "CA_3", recent_7d: 48.0, forecast_7d: 52.30, uplift_pct: 9.0, forecast_value: "$117.15", spike_score: 0.85, recommendation: "Adequate Stock", action_color: "green" },
  { item_id: "HOBBIES_1_001", store_id: "TX_1", recent_7d: 22.0, forecast_7d: 23.10, uplift_pct: 5.0, forecast_value: "$190.81", spike_score: 0.42, recommendation: "Adequate Stock", action_color: "green" },
  { item_id: "HOBBIES_1_019", store_id: "WI_2", recent_7d: 18.0, forecast_7d: 18.20, uplift_pct: 1.1, forecast_value: "$45.14", spike_score: 0.12, recommendation: "Adequate Stock", action_color: "green" },
  { item_id: "HOBBIES_1_008", store_id: "CA_2", recent_7d: 31.0, forecast_7d: 27.50, uplift_pct: -11.3, forecast_value: "$12.65", spike_score: -0.92, recommendation: "Overstocked / De-prioritize", action_color: "slate" },
  { item_id: "HOBBIES_1_002", store_id: "WI_1", recent_7d: 19.0, forecast_7d: 16.40, uplift_pct: -13.7, forecast_value: "$65.11", spike_score: -1.15, recommendation: "Overstocked / De-prioritize", action_color: "slate" }
];

export const MOCK_SPIKES = [
  { date: "2016-04-12", item_id: "HOBBIES_1_073", store_id: "CA_1", sales: 12, expected_sales: 1.85, spike_score: 4.82, reason: "Unexpected surge: 6.5x above 28-day moving average" },
  { date: "2016-04-14", item_id: "HOBBIES_1_045", store_id: "CA_1", sales: 10, expected_sales: 2.10, spike_score: 3.94, reason: "Volume surge: exceeds Poisson upper confidence threshold" },
  { date: "2016-04-17", item_id: "HOBBIES_1_268", store_id: "CA_1", sales: 15, expected_sales: 3.40, spike_score: 3.65, reason: "Multi-unit bulk basket purchase pattern" },
  { date: "2016-04-19", item_id: "HOBBIES_1_004", store_id: "CA_3", sales: 24, expected_sales: 7.20, spike_score: 3.38, reason: "Weekend promotional coupon redemption event" },
  { date: "2016-04-21", item_id: "HOBBIES_1_238", store_id: "CA_1", sales: 9, expected_sales: 2.25, spike_score: 3.12, reason: "Sudden velocity shift following stock replenishment" }
];

export const MOCK_PERFORMANCE_BENCHMARKS = [
  { fraction: "10% Data (50,503 rows)", pandas_sec: 0.52, spark_sec: 14.2, speedup_comment: "Pandas faster for tiny in-memory slices due to PySpark JVM overhead" },
  { fraction: "50% Data (252,516 rows)", pandas_sec: 1.13, spark_sec: 28.5, speedup_comment: "PySpark partition scaling begins to converge as cores are saturated" },
  { fraction: "100% Data (505,032 rows)", pandas_sec: 2.25, spark_sec: 56.9, speedup_comment: "PySpark handles full joins, rolling window partitions, and MLlib GBT cleanly" },
  { fraction: "10x Projected (5,050,000 rows)", pandas_sec: "OOM Crash (Memory > 16GB)", spark_sec: 142.0, speedup_comment: "PySpark scales out across cluster partitions where Pandas fails with OOM" }
];

export const MOCK_TIME_SERIES = [
  { date: "2016-03-28", actual: 38, gbt: 36, rf: 35, dt: 33, ma: 37 },
  { date: "2016-03-29", actual: 34, gbt: 35, rf: 34, dt: 31, ma: 36 },
  { date: "2016-03-30", actual: 31, gbt: 33, rf: 33, dt: 29, ma: 35 },
  { date: "2016-03-31", actual: 39, gbt: 37, rf: 36, dt: 35, ma: 36 },
  { date: "2016-04-01", actual: 45, gbt: 43, rf: 41, dt: 39, ma: 38 },
  { date: "2016-04-02", actual: 62, gbt: 59, rf: 58, dt: 54, ma: 42 },
  { date: "2016-04-03", actual: 58, gbt: 56, rf: 55, dt: 51, ma: 44 },
  { date: "2016-04-04", actual: 36, gbt: 38, rf: 37, dt: 35, ma: 43 },
  { date: "2016-04-05", actual: 32, gbt: 34, rf: 34, dt: 32, ma: 41 },
  { date: "2016-04-06", actual: 35, gbt: 35, rf: 35, dt: 33, ma: 40 },
  { date: "2016-04-07", actual: 37, gbt: 38, rf: 37, dt: 36, ma: 39 },
  { date: "2016-04-08", actual: 48, gbt: 46, rf: 45, dt: 42, ma: 41 },
  { date: "2016-04-09", actual: 65, gbt: 63, rf: 61, dt: 58, ma: 45 },
  { date: "2016-04-10", actual: 61, gbt: 59, rf: 57, dt: 54, ma: 47 },
  { date: "2016-04-11", actual: 34, gbt: 36, rf: 36, dt: 34, ma: 45 },
  { date: "2016-04-12", actual: 52, gbt: 48, rf: 46, dt: 43, ma: 44 },
  { date: "2016-04-13", actual: 38, gbt: 37, rf: 37, dt: 35, ma: 45 },
  { date: "2016-04-14", actual: 44, gbt: 42, rf: 41, dt: 38, ma: 44 },
  { date: "2016-04-15", actual: 49, gbt: 47, rf: 46, dt: 43, ma: 45 },
  { date: "2016-04-16", actual: 68, gbt: 65, rf: 63, dt: 59, ma: 48 },
  { date: "2016-04-17", actual: 64, gbt: 62, rf: 60, dt: 56, ma: 50 },
  { date: "2016-04-18", actual: 39, gbt: 40, rf: 39, dt: 37, ma: 49 },
  { date: "2016-04-19", actual: 37, gbt: 38, rf: 37, dt: 36, ma: 48 },
  { date: "2016-04-20", actual: 36, gbt: 37, rf: 37, dt: 35, ma: 47 },
  { date: "2016-04-21", actual: 42, gbt: 41, rf: 40, dt: 38, ma: 47 },
  { date: "2016-04-22", actual: 51, gbt: 49, rf: 48, dt: 45, ma: 48 },
  { date: "2016-04-23", actual: 72, gbt: 69, rf: 67, dt: 63, ma: 52 },
  { date: "2016-04-24", actual: 67, gbt: 64, rf: 63, dt: 59, ma: 53 }
];
