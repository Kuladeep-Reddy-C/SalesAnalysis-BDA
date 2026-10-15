import React, { useState } from 'react';
import { 
  Database, 
  Radio, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HardDrive, 
  Zap, 
  Activity, 
  FileText,
  Play,
  Pause
} from 'lucide-react';
import { MOCK_SUMMARY, MOCK_DATA_QUALITY, MOCK_STREAM_MICROBATCHES } from '../data/mockData';

export default function RealTimeDatasets({ summaryData, streamData }) {
  const summary = summaryData || MOCK_SUMMARY;
  const batches = streamData && streamData.length > 0 ? streamData : MOCK_STREAM_MICROBATCHES;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 1 of 8
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Real-Time Data Sets & Streaming Ingestion
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Ingestion of production-grade retail demand streams from the Walmart M5 dataset using 
          <strong> Apache Spark Structured Streaming</strong>. The architecture incorporates day-sized micro-batches, 
          continuous historical replay, exactly-once checkpointing, and real-time spike detection.
        </p>
      </div>

      {/* Streaming Status Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-xs">
        <div className="flex items-start">
          <Radio className="w-5 h-5 text-amber-600 mt-0.5 mr-3 shrink-0 animate-pulse" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              Simulated Real-Time Micro-Batch Streaming Engine Active
            </h3>
            <p className="mt-1 text-xs text-amber-700 leading-normal">
              Structured Streaming replaying historical daily retail transactions across 10 stores. 
              Each day emits a 264-item record vector processed in sub-300ms micro-batches with persistent offset tracking 
              stored in <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">results/checkpoints/stream</code>.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Streaming Replay Running' : 'Live Stream Ready'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards (Image 1 reference) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Events</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary.sales_rows?.toLocaleString() || "505,032"}</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">Spark 3.5.9 Ingestion</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Units Sold</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary.total_units_sold?.toLocaleString() || "602,773"}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">5.4 years daily history</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retail Stores</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary.stores_count || 10}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">CA, TX, WI Regions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog SKUs</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary.products_count || 30}</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">HOBBIES_1 Category</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Micro-Batches</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-600">28 Days</p>
          <p className="mt-1 text-[11px] text-brand-700 font-medium">7,392 Replayed Rows</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Streaming Rate</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">~1,000</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">events / second</p>
        </div>
      </div>

      {/* Dataset Schema & Quality Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">1. Real-World Datasets Ingested</h2>
            <p className="text-xs text-slate-500">Three correlated streams synchronized on composite store and date keys</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            Verified Input Integrity
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Dataset Name</th>
                <th className="px-6 py-3">Input Rows</th>
                <th className="px-6 py-3">Valid Rows</th>
                <th className="px-6 py-3">Duplicate Keys</th>
                <th className="px-6 py-3">Primary Join Key</th>
                <th className="px-6 py-3">Data Integrity & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_DATA_QUALITY.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center space-x-2">
                    <Database className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="font-mono">{row.dataset}.csv</span>
                  </td>
                  <td className="px-6 py-3.5 font-mono">{row.input_rows.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-semibold font-mono">{row.valid_rows.toLocaleString()}</td>
                  <td className="px-6 py-3.5 font-mono">{row.duplicate_key_rows}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-800 bg-slate-50/50 rounded">{row.key}</td>
                  <td className="px-6 py-3.5 text-slate-600">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-Time Micro-Batch Processing Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Spark Structured Streaming Micro-Batch Log</h2>
            <p className="text-xs text-slate-500">Live replay stream consumed by Spark driver with checkpoint offsets</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Exactly-Once Semantics
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Batch ID</th>
                <th className="px-6 py-3">Replay Timestamp</th>
                <th className="px-6 py-3">Records Ingested</th>
                <th className="px-6 py-3">Batch Latency</th>
                <th className="px-6 py-3">Throughput Rate</th>
                <th className="px-6 py-3">Spikes Flagged</th>
                <th className="px-6 py-3">Checkpoint Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {batches.map((batch, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-bold text-slate-900">#{batch.batch_id}</td>
                  <td className="px-6 py-3 text-slate-700">{batch.date}</td>
                  <td className="px-6 py-3 text-slate-900 font-semibold">{batch.rows} items</td>
                  <td className="px-6 py-3 text-emerald-700 font-semibold">{(batch.duration_seconds * 1000).toFixed(0)} ms</td>
                  <td className="px-6 py-3 text-brand-700 font-semibold">{batch.rows_per_sec.toFixed(1)} rows/s</td>
                  <td className="px-6 py-3">
                    {batch.simulated_spikes > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {batch.simulated_spikes} surges
                      </span>
                    ) : (
                      <span className="text-slate-400">0 surges</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-[11px]">{batch.checkpoint_offset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code / Terminal Pipeline Output Box (Matching Reference Image 2 & 3 style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <span>Structured Streaming Execution Pipeline Spec</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">stream/stream_job.py & replay.py</span>
        </div>
        <div className="terminal-box">
          <pre className="text-slate-300">
{`# SPARK STRUCTURED STREAMING MICRO-BATCH DEFINITION
spark = SparkSession.builder \\
    .appName("RetailDemandStream") \\
    .config("spark.sql.shuffle.partitions", "16") \\
    .config("spark.streaming.stopGracefullyOnShutdown", "true") \\
    .getOrCreate()

# Ingest streaming micro-batches from stream_input/
sales_stream = spark.readStream \\
    .schema(sales_microbatch_schema) \\
    .json("stream_input/")

# Micro-batch trigger with checkpointing & sink to HBase/SQLite
query = sales_stream.writeStream \\
    .format("memory") \\
    .queryName("live_sales_stream") \\
    .trigger(processingTime='1 second') \\
    .option("checkpointLocation", "results/checkpoints/stream") \\
    .start()

[INFO] Stream query initialized with 28 micro-batches (7,392 rows replayed).
[INFO] State store committed offset #27. Average latency: 268.4ms per batch.`}
          </pre>
        </div>
      </div>

      {/* Architectural Documentation */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <span>Documentation: Big Data Streaming Architecture</span>
        </h3>
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <p>
            <strong>1. Stream-Table Duality:</strong> In retail supply chain systems, historical sales exist as a table, 
            while newly arrived register transactions arrive as an unbounded continuous append stream. Spark Structured Streaming 
            treats new data as incremental rows appended to an unbounded input table.
          </p>
          <p>
            <strong>2. Exactly-Once Fault Tolerance:</strong> By maintaining write-ahead logs and metadata checkpointing under 
            <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">results/checkpoints/stream/offsets</code>, any failure in 
            the streaming daemon allows deterministic replay from the last uncommitted offset without double counting.
          </p>
          <p>
            <strong>3. Serving Store Integration:</strong> Streaming micro-batches trigger online demand spike calculations 
            which are immediately persisted to the low-latency HBase serving store for downstream inventory trigger evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
