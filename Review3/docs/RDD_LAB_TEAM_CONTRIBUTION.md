# Spark RDD Lab — Team Contribution & Viva Study Guide

> **Project**: Retail Demand Forecasting & RDD Analytics  
> **Source Modules**:  
> - [`Review3/analytics/rdd_lab1.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab1.py) (Pavan Krishna)  
> - [`Review3/analytics/rdd_lab2.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab2.py) (Abhiram Bikkina)  
> - [`Review3/analytics/rdd_lab3.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab3.py) (P G Raja)  
> - [`Review3/analytics/rdd_lab4.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab4.py) (Kuladeep)  
> **Dashboard**: `http://localhost:5173/#rdd-lab` (Tab: **RDD Lab**)

---

## 🎯 How to Explain the Collaboration to Your Teacher
When the teacher asks: *"How did you divide the work, or did everyone do everything?"*

**Answer to give**:
> *"We followed an end-to-end collaborative approach. Rather than splitting tasks into disconnected silos (like one person writing only filters and another only writing actions), **all four of us jointly architected the core Spark RDD execution architecture** (`execute_rdd`, persistence, stage boundaries, and DAG lineage).  
> Then, to prove mastery across all Spark concepts, **each of us formulated, designed, and executed a distinct retail scenario with a unique key-value architecture and business objective in dedicated modules (`rdd_lab1.py` through `rdd_lab4.py`)**. Thus, every team member worked through the entire lifecycle: raw RDD ingestion, narrow transformations, wide shuffles, persistence, actions, partition analysis, and DAG lineage verification."*

---

## 👥 Person-by-Person Breakdown

```
+----------------------------------------------------------------------------------------------------+
|                                    SHARED SPARK RDD CORE ENGINE                                    |
|   raw = textFile() -> filter(header) -> map(parse_sales) -> filter() -> persist()                 |
|   -> map(project) -> flatMap() -> reduceByKey() -> groupByKey() -> mapValues() -> sortByKey()      |
|   -> Actions: first(), count(), take(8), collect() -> Lineage: toDebugString()                     |
+----------------------------------------------------------------------------------------------------+
          |                              |                              |                            |
          v                              v                              v                            v
    PAVAN KRISHNA                 ABHIRAM BIKKINA                    P G RAJA                    KULADEEP
   (rdd_lab1.py)                  (rdd_lab2.py)                  (rdd_lab3.py)                (rdd_lab4.py)
   Product Velocity              Department Demand             Store/Category Mix           Intermittent Demand
  Key: `item_id`                 Key: `dept_id`             Key: `store_id + cat_id`      Key: `item_id` (Active)
  Granular SKU Replenishment    Category Workload Planning    Spatial Cross-Analysis       Frequency vs Volume
```

---

### 👤 1. Pavan Krishna: Product Velocity (SKU Replenishment Prioritization)

#### 1. Code Snippet
* **Location**: [`Review3/analytics/rdd_lab1.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab1.py)
```python
PROFILE = {
    "id": "scenario-1-product-velocity",
    "title": "Product velocity",
    "question": "Which products contribute the most demand, and how many sales observations support that result?",
    "purpose": "Product-level prioritisation for replenishment review.",
    "key_description": "item_id",
    "project": lambda row: (row[0], row[5]),  # (item_id, sales_quantity)
    "filter": lambda row: row[5] > 0,          # filter out zero-sales days
}
```

#### 2. What the Code Does & Business Logic
* **Objective**: Solves individual product replenishment prioritization.
* **Mechanism**: Filters records where `sales > 0` (`row[5] > 0`), isolating active transactions (161,725 records).
* **Key Design**: Uses **`row[0]` (`item_id`)** as the key paired with **`row[5]` (sales volume)**.
* **Result**: Identifies top SKUs like `HOBBIES_1_268` (18,904 units) so supply chain teams know exactly which items have the highest stockout risk.

#### 3. How to Justify the Rubric Concepts
* **RDD**: Loaded from `sales_processed_clean.csv` via `textFile()`.
* **Transformations**: 
  * `map(_parse_sales)` parses CSV columns into typed tuples.
  * `filter(row[5] > 0)` removes non-sales rows (Narrow transformation).
  * `map(lambda row: (item_id, sales))` structures the Pair RDD.
  * `reduceByKey(add)` aggregates total sales per SKU (Wide transformation / Shuffle).
  * `groupByKey()` & `mapValues(sum)` count observations supporting that volume.
  * `sortByKey()` / `sortBy()` ranks the highest velocity products.
* **Actions**: `records.count()` verifies 161,725 filtered rows; `take(8)` retrieves top velocity SKUs for immediate display.
* **Key/Value Operations**: Demonstrates individual entity keying (`item_id -> float`), aggregated via `reduceByKey` with local combiner optimization.
* **Partitions**: Distributed across 2 partitions (Partition 0: 67,798 rows, Partition 1: 93,927 rows), verified with `mapPartitionsWithIndex()`.
* **Persistence**: Calls `records.persist()` (`StorageLevel: Memory Serialized 1x Replicated`, 1.4 MiB). Prevents re-reading and re-filtering 505,033 raw rows when calculating both `reduceByKey` totals and `groupByKey` counts.
* **Lineage & DAG**: Single-parent narrow stages (`HadoopRDD -> MapPartitionsRDD -> PythonRDD`) pipelined together. `reduceByKey` introduces a stage boundary requiring network shuffle.
* **Fault Tolerance**: If partition 1 is dropped in memory, Spark traces `toDebugString()` back to `sales_processed_clean.csv` and re-applies `filter -> map` without restarting the application.

---

### 👤 2. Abhiram Bikkina: Department Demand (Workload & Capacity Planning)

#### 1. Code Snippet
* **Location**: [`Review3/analytics/rdd_lab2.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab2.py)
```python
PROFILE = {
    "id": "scenario-2-department-demand",
    "title": "Department demand",
    "question": "How is demand distributed across departments?",
    "purpose": "Department-level workload planning for category managers.",
    "key_description": "dept_id",
    "project": lambda row: (row[1], row[5]),  # (dept_id, sales_quantity)
    "filter": lambda row: row[5] >= 0,         # includes all valid sales records
}
```

#### 2. What the Code Does & Business Logic
* **Objective**: Category-level workload and warehouse throughput planning.
* **Mechanism**: Keeps all valid sales days (`sales >= 0`, 505,032 records) to capture full baseline operational scope.
* **Key Design**: Uses **`row[1]` (`dept_id`, e.g., `HOBBIES_1`)** as the key.
* **Result**: Aggregates demand at the department scale (`HOBBIES_1` = 492,504.0 units), allowing warehouse category managers to allocate floor space, shelf staff, and forklift labor.

#### 3. How to Justify the Rubric Concepts
* **RDD**: Text-based distributed dataset representing the complete catalog history.
* **Transformations**: Evaluates categorical rollup using `map(lambda row: (dept_id, sales))` and `reduceByKey(add)` to collapse hundreds of thousands of SKU rows into distinct department buckets.
* **Actions**: `first()` extracts the CSV header; `take(8)` extracts department summaries; `count()` confirms 505,032 records processed.
* **Key/Value Operations**: High reduction ratio Pair RDD aggregation. Thousands of records per partition combine locally before shuffle reduction.
* **Partitions**: Evaluated across 2 partitions. Shows how Spark distributes 505,032 rows evenly across executor cores.
* **Persistence**: Persists the full 505,032-row RDD (`MemorySize: 4.0 MiB; DiskSize: 0.0 B`). Shows the scaling of memory serialization when caching a 3x larger working dataset compared to Scenario 1.
* **Lineage & DAG**: Visible via `PythonRDD[29]`. Proves lazy evaluation: the entire lineage graph was built first and only executed when `.take(8)` was called.
* **Fault Tolerance**: Spark's lineage graph recomputes any lost partition by replaying `parse_sales` on that partition’s byte offset in the CSV file.

---

### 👤 3. P G Raja: Store/Category Mix (Spatial Cross-Analysis)

#### 1. Code Snippet
* **Location**: [`Review3/analytics/rdd_lab3.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab3.py)
```python
PROFILE = {
    "id": "scenario-3-store-category-mix",
    "title": "Store/category mix",
    "question": "Which store and category combinations carry the strongest demand?",
    "purpose": "Store-category comparison that remains useful when more stores are loaded.",
    "key_description": "store_id + cat_id",
    "project": lambda row: (f"{row[3]} @ {row[2]}", row[5]),  # composite key: "CA_1 @ HOBBIES"
    "filter": lambda row: row[5] > 0,
}
```

#### 2. What the Code Does & Business Logic
* **Objective**: Spatial and merchandising cross-interaction analysis.
* **Mechanism**: Creates a synthetic composite key by string interpolation: `f"{row[3]} @ {row[2]}"` (`store_id @ cat_id`).
* **Key Design**: **Composite Key (`store_id + cat_id`)**. Demonstrates advanced pair RDD engineering when an analysis spans multiple dimensional hierarchies.
* **Result**: Determines the exact store-category combination driving revenue (`CA_1 @ HOBBIES` = 492,504.0 units).

#### 3. How to Justify the Rubric Concepts
* **RDD**: Distributed Pair RDD holding composite keys: `RDD[Tuple[str, float]]`.
* **Transformations**: 
  * Custom projection lambda synthesizing composite keys.
  * `flatMap(lambda pair: [(pair[0], pair[1])])` demonstrating flat mapping of tuple collections.
  * `reduceByKey(add)` aggregating composite group totals.
  * `sortByKey()` alphabetically ordering store-category combinations.
* **Actions**: `collect()` on `mapPartitionsWithIndex` to return partition layout directly to driver; `take(8)` for top volume pairs.
* **Key/Value Operations**: Composite keying allows Spark's partitioner (`HashPartitioner`) to distribute multidimensional keys evenly across workers using key hash codes.
* **Partitions**: 2 partitions; hash partitioning guarantees identical store-category pairs land on the same reducer.
* **Persistence**: Cached in memory (`1456.4 KiB`). Reused across both `totals` and `observation_counts` actions without redundant string concatenation.
* **Lineage & DAG**: Visible via `PythonRDD[57]`. Illustrates how wide transformations (`reduceByKey`) create shuffle read and shuffle write stages in Spark DAG Scheduler.
* **Fault Tolerance**: If a node fails during the shuffle stage of composite key aggregation, Spark re-executes the map and filter stages using its lineage tree.

---

### 👤 4. Kuladeep: Intermittent Demand Activity (Sales Frequency Analysis)

#### 1. Code Snippet
* **Location**: [`Review3/analytics/rdd_lab4.py`](file:///home/kuladeepreddyc/Documents/BigData/Review3/analytics/rdd_lab4.py)
```python
PROFILE = {
    "id": "scenario-4-intermittent-demand",
    "title": "Intermittent demand activity",
    "question": "Which products have the most active selling days rather than only the largest totals?",
    "purpose": "Separate frequent activity from one-off high-volume demand.",
    "key_description": "item_id on positive-sales days",
    "project": lambda row: (row[0], 1.0),     # indicator variable: 1.0 per active day
    "filter": lambda row: row[5] > 0,          # only active sales days
}
```

#### 2. What the Code Does & Business Logic
* **Objective**: Differentiates steady, recurring consumer demand from one-time bulk spikes (Croston’s intermittent demand method).
* **Mechanism**: Projects a constant indicator value `1.0` for every positive sales observation (`(item_id, 1.0)`).
* **Key Design**: **Active-Day Indicator Key-Value Pair**.
* **Result**: Top product by frequency is `HOBBIES_1_254` with **1,677 active selling days**, even though Scenario 1's volume analysis showed `HOBBIES_1_268` had the highest raw volume. This reveals `HOBBIES_1_254` has much higher sales reliability.

#### 3. How to Justify the Rubric Concepts
* **RDD**: Pair RDD acting as a distributed binary indicator matrix.
* **Transformations**: 
  * `filter(sales > 0)` isolates active dates.
  * `project = (row[0], 1.0)` transforms continuous sales into discrete frequency counts.
  * `reduceByKey(add)` sums active day occurrences per item.
  * `mapValues()` and `sortByKey()` calculate frequency distributions.
* **Actions**: `take(8)` extracts the highest-frequency items; `records.count()` validates 161,725 total active item-day records.
* **Key/Value Operations**: High-throughput frequency summation using `reduceByKey` as an associative and commutative counter across partitions.
* **Partitions**: Distributed across 2 partitions, demonstrating balanced counting across executors.
* **Persistence**: Preserved in memory (`MemorySize: 1456.4 KiB`). Reused across frequency sorting and observation counts.
* **Lineage & DAG**: Visible via `PythonRDD[85]`. Represents an end-to-end MapReduce-style frequency counter built entirely with native Spark RDD primitives.
* **Fault Tolerance**: Deterministic recomputation from CSV source guaranteed by mathematical idempotence of `(item_id, 1.0)`.

---

## 📊 Summary Comparison Table for the Team

| Team Member | Module | Retail Question | Key Design | Filter Criteria | Top Result | Persistence Footprint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Pavan Krishna** | `rdd_lab1.py` | Top volume replenishment | `item_id` | `sales > 0` | `HOBBIES_1_268` (18,904.0) | 1,456.4 KiB (2 partitions) |
| **Abhiram Bikkina** | `rdd_lab2.py` | Department workload | `dept_id` | `sales >= 0` | `HOBBIES_1` (492,504.0) | 4.0 MiB (2 partitions) |
| **P G Raja** | `rdd_lab3.py` | Store/category mix | `store_id + cat_id` | `sales > 0` | `CA_1 @ HOBBIES` (492,504.0) | 1,456.4 KiB (2 partitions) |
| **Kuladeep** | `rdd_lab4.py` | Intermittent demand activity | `item_id` (active days) | `sales > 0` | `HOBBIES_1_254` (1,677.0 days) | 1,456.4 KiB (2 partitions) |

---

## 🎓 Rapid-Fire Viva Q&A (What Your Teacher Might Ask)

### Q1: Why did you use `reduceByKey` instead of `groupByKey` for calculating totals?
> **Answer**: `reduceByKey` performs **map-side aggregation** (combiner phase) before data is shuffled across the network. It combines pairs locally on each partition, vastly reducing network I/O. In contrast, `groupByKey` transfers all key-value pairs across the network without combining, which can cause severe memory spills and `OutOfMemoryError`.

### Q2: What is the difference between Narrow and Wide transformations in your DAG?
> **Answer**: 
> * **Narrow transformations** (`map`, `filter`, `mapValues`): Each partition of the parent RDD is used by at most one partition of the child RDD. They require **no shuffle** and are pipelined together in Stage 1.
> * **Wide transformations** (`reduceByKey`, `groupByKey`, `sortByKey`): Multiple child partitions depend on data from all parent partitions, requiring an expensive network **shuffle** that defines Stage boundaries in the Spark DAG.

### Q3: Why is `.persist()` called before `take` and `count`?
> **Answer**: RDDs are lazily evaluated and not stored in memory by default. Because our workflow calls multiple actions (`records.count()`, `totals.take()`, `sorted_counts.take()`, `partition_preview.collect()`), without `.persist()` Spark would re-read the CSV and re-execute all transformations from scratch for every single action. Caching ensures the cleaned dataset is computed once and held in RAM.

### Q4: How does your code prove Fault Tolerance?
> **Answer**: We print `records.toDebugString()`. If an executor node crashes and loses Partition 1, Spark does not restart the entire job. It consults the lineage DAG (`PythonRDD -> MapPartitionsRDD -> HadoopRDD`) and recomputes only Partition 1 from the raw file offsets.
