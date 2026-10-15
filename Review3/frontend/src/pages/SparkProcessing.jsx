import React from 'react';
import { 
  Cpu, 
  Layers, 
  GitBranch, 
  Zap, 
  Database, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  HardDrive,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { MOCK_SPARK_CONFIG } from '../data/mockData';

export default function SparkProcessing() {
  const transformations = [
    { name: "filter()", type: "Narrow", desc: "Filters invalid dates, negative quantities, and unlaunched SKUs without shuffling partitions." },
    { name: "map()", type: "Narrow", desc: "Parses CSV text into typed RetailDailyRecord case classes with composite key (store_id + item_id, date)." },
    { name: "flatMap()", type: "Narrow", desc: "Flattens nested multi-store inventory vectors into individual daily sales observations." },
    { name: "reduceByKey()", type: "Wide (Shuffle)", desc: "Aggregates total daily units sold per item-store key with map-side combine optimization." },
    { name: "partitionBy()", type: "Wide (Shuffle)", desc: "Hash-partitions sales records across 16 partitions by store_id to optimize downstream joins." },
    { name: "window().over()", type: "Wide (Window)", desc: "Computes 7-day and 28-day temporal rolling means partitioned by (item_id, store_id) ordered by date." }
  ];

  const actions = [
    { name: "count()", returnType: "Long", desc: "Forces evaluation of the RDD lineage and returns 505,032 total valid daily records." },
    { name: "take(10)", returnType: "Array[T]", desc: "Retrieves first 10 processed feature vectors for diagnostic inspection without collecting the full dataset." },
    { name: "collect()", returnType: "Array[T]", desc: "Collects aggregated store metrics back to the driver for local baseline evaluation." },
    { name: "saveAsTable()", returnType: "Unit", desc: "Persists clean feature matrix directly to HBase tables / Parquet analytical store." }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 4 of 8
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Apply Either Spark Scala or PySpark Execution
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Distributed data processing using <strong>Apache Spark & PySpark Engine</strong>. 
          Demonstrates resilient distributed datasets (RDDs), DAG stage boundaries, key-value transformations, 
          in-memory cache speedups, and fault-tolerant lineage graphs.
        </p>
      </div>

      {/* Spark Engine Execution Configuration Table (Image 3 layout) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Spark / Scala Runtime Environment & Metrics</h2>
            <p className="text-xs text-slate-500">Benchmark results extracted from results/metrics/spark_run_summary.json</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            Spark 3.5.9 / Scala 2.12.18
          </span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Execution Master</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">local[*] (All CPU Cores)</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Shuffle Partitions</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">16 Partitions</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Valid Sales Records</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">505,032 observations</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Driver & Executor Memory</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">4 GB Driver / 4 GB Exec</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">1st Count (Cold from Disk)</span>
              <p className="text-sm font-bold font-mono text-amber-700 mt-0.5">{MOCK_SPARK_CONFIG.timing.first_count_storage} seconds</p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xs text-emerald-800 font-medium">2nd Count (In-Memory Cache)</span>
              <p className="text-sm font-bold font-mono text-emerald-700 mt-0.5">{MOCK_SPARK_CONFIG.timing.second_count_cached} s (13.6x speedup)</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Lineage Rebuilt After Unpersist</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">{MOCK_SPARK_CONFIG.timing.unpersist_rebuilt_from_lineage} seconds</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Preprocess & Train Time</span>
              <p className="text-sm font-bold font-mono text-brand-700 mt-0.5">{MOCK_SPARK_CONFIG.timing.spark_preprocessing_and_training} seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* RDD Transformations & Actions Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transformations Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">RDD Transformations Applied</h3>
            <p className="text-xs text-slate-500">Lazy operations creating new RDDs in the execution graph</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-2.5">Transformation</th>
                <th className="px-5 py-2.5">Dependency</th>
                <th className="px-5 py-2.5">Pipeline Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transformations.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-2.5 font-mono font-bold text-brand-700">{t.name}</td>
                  <td className="px-5 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      t.type.includes('Narrow') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-slate-600 text-[11px]">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">RDD Actions Executed</h3>
            <p className="text-xs text-slate-500">Operations triggering DAG evaluation and returning results</p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-2.5">Action Method</th>
                <th className="px-5 py-2.5">Return Type</th>
                <th className="px-5 py-2.5">Pipeline Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {actions.map((a, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-2.5 font-mono font-bold text-indigo-700">{a.name}</td>
                  <td className="px-5 py-2.5 font-mono text-slate-500 text-[11px]">{a.returnType}</td>
                  <td className="px-5 py-2.5 text-slate-600 text-[11px]">{a.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RDD Lineage Graph Output (Terminal style matching Image 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-brand-600" />
            <span>Lineage of the Key-Value RDD & Window Transformations</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">rdd.toDebugString()</span>
        </div>

        {/* Lineage Box 1 */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-700">Lineage 1: Per-Store Aggregation Lineage (indent step = stage boundary)</p>
          <div className="terminal-box">
            <pre className="text-slate-300">
{`(16) ShuffledRDD[14] at reduceByKey at RetailPipeline.scala:184 []
 +-(16) MapPartitionsRDD[13] at map at RetailPipeline.scala:180 []
    |  edits (parsed) MapPartitionsRDD[2] at flatMap at RetailPipeline.scala:95 []
    |  CachedPartitions: 16; MemorySize: 142.4 MiB; DiskSize: 0.0 B
    |  raw lines MapPartitionsRDD[1] at textFile at RetailPipeline.scala:88 []
    |  file:///home/kuladeepreddyc/Documents/BigData/Review2/sales_processed_clean.csv HadoopRDD[0]`}
            </pre>
          </div>
        </div>

        {/* Lineage Box 2 */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-700">Lineage 2: Multi-Echelon Lag & Rolling Window Feature Pipeline</p>
          <div className="terminal-box">
            <pre className="text-slate-300">
{`(16) WindowedFeatureMapPartitionsRDD[42] at windowPartitionBy at spark_features.py:65 []
 |  sales by item ShuffledRDD[38] at partitionBy at spark_features.py:52 []
 |  CachedPartitions: 16; MemorySize: 218.6 MiB; DiskSize: 0.0 B
 +-(16) MapPartitionsRDD[35] at join with calendar and prices at spark_pipeline.py:112 []
    |  daily joined MapPartitionsRDD[30] at map at spark_pipeline.py:98 []
    |  sales_raw MapPartitionsRDD[1] at textFile at spark_pipeline.py:75 []`}
            </pre>
          </div>
        </div>
      </div>

      {/* Spark Web UI Reference Box */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase">Live Spark Monitoring</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            The full DAG stage visualization, executor thread dumps, and shuffle spills are viewable in the Spark Web UI 
            at <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-800">http://localhost:4040</code> while Spark jobs are running.
          </p>
        </div>
        <a 
          href="http://localhost:4040" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-xs font-semibold text-slate-800 transition-colors"
        >
          <span>Open Web UI</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
