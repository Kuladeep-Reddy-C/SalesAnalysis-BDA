import React from 'react';
import { 
  HelpCircle, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Layers, 
  Cpu, 
  BarChart3, 
  Database, 
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { MOCK_SUMMARY } from '../data/mockData';

export default function FrameAnalysisQuestion() {
  const pipelineSteps = [
    { num: 1, title: "1. Dataset", desc: "Walmart M5 Real Streams, 505k sales, prices, calendar; cleaned in Review 2" },
    { num: 2, title: "2. Scala + Spark", desc: "RDD transformations, actions, key/value partitions, cache & lineage DAG" },
    { num: 3, title: "3. Feature Matrix", desc: "Lags (1, 7, 28), rolling windows (7, 28d), availability flag; 497k rows" },
    { num: 4, title: "4. PySpark MLlib", desc: "3 ML models (DT, RF, GBT); chronological holdout, 7-day rolling origin" },
    { num: 5, title: "5. HBase Serving", desc: "Serving tables (forecasts, spikes, decisions) via low-latency REST/Thrift" },
    { num: 6, title: "6. React Dashboard", desc: "8-page decision console with interactive Recharts & live API sync" }
  ];

  const presentationTimeline = [
    { time: "00 – 03 min", title: "Problem Definition & Intermittent Retail Data", focus: "73% zero-sales sparsity, catalog lifecycle, business cost of stockouts" },
    { time: "03 – 06 min", title: "Distributed Spark & Scala RDD Execution", focus: "Partitions, RDD transformations (map, reduceByKey), 13.6x cache speedup, DAG lineage" },
    { time: "06 – 09 min", title: "PySpark Machine Learning & Model Evaluation", focus: "Decision Tree vs Random Forest vs GBT Champion (WAPE 0.899) vs statistical baselines" },
    { time: "09 – 12 min", title: "Visualizations & Diagnostic Residuals", focus: "Actual vs predicted demand timelines, horizon error curves, feature importance ranking" },
    { time: "12 – 15 min", title: "Inventory Decision Matrix & Scalability Benchmarks", focus: "Uplift procurement triggers, injected spike validation, 10x cluster scaling analysis" }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 3 of 8
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Frame Analysis Question (15-Minute Defense Scope)
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Formal formulation of the big data analytics inquiry, core research hypotheses, 
          15-minute presentation defense strategy, and end-to-end pipeline architecture.
        </p>
      </div>

      {/* The Central Question Box (Inspired by Image 1) */}
      <div className="bg-white rounded-xl p-6 border-l-4 border-brand-600 border-t border-r border-b border-slate-200 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-brand-50 rounded-lg text-brand-600 shrink-0 mt-1">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">The Big Data Question</h2>
            <p className="mt-2 text-base text-slate-700 leading-relaxed font-medium">
              "Which retail items and stores experience high-risk stockout demand surges vs intermittent zero-demand periods, 
              and can distributed Apache Spark data processing combined with PySpark machine learning proactively forecast 
              and recommend actionable inventory re-order uplifts before costly stockouts occur?"
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Intermittent Demand</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Zero-Inflation (73%)</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Spark MLlib Ensembles</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">HBase Online Serving</span>
              <span className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-md">Actionable Decision Output</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards (Image 1 reference) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Edits Processed</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">505,032</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">Spark 3.5.9 RDDs</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retail Stores</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">10</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">CA, TX, WI</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modeled Catalog</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">30 SKUs</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">HOBBIES_1 Category</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ML Ensembles</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">3 Models</p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">DT, RF, GBT</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Champion WAPE</p>
          <p className="mt-2 text-2xl font-extrabold text-brand-600">0.899</p>
          <p className="mt-1 text-[11px] text-brand-700 font-medium">Gradient Boosting</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Uplift Triggers</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">25 SKUs</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">HBase Online Serving</p>
        </div>
      </div>

      {/* Horizontal Pipeline Steps (Identical to Image 1 layout) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Target className="w-4 h-4 text-brand-600" />
          <span>Big Data Pipeline Architecture</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="relative bg-slate-50 border border-slate-200 rounded-lg p-3.5 hover:border-brand-500 transition-colors">
              <div className="text-xs font-extrabold text-brand-600 mb-1">{step.title}</div>
              <p className="text-[11px] text-slate-600 leading-snug">{step.desc}</p>
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Summary (Identical to Image 1 Decision section) */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Decision Rule Formulation</span>
        </h3>
        <p className="text-xs text-slate-700 leading-relaxed">
          Items whose 7-day recursive ML forecast exceeds their recent 7-day moving baseline by 
          <strong> &gt; 10% volume uplift</strong> are flagged with an actionable <em>Reorder Recommendation</em> in HBase, 
          prioritized by revenue value signal ($). This transforms raw statistical regression into proactive supply chain 
          replenishment orders, preventing stockouts during seasonal demand spikes.
        </p>
      </div>

      {/* 15-Minute Defense Strategy Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>15-Minute Defense & Review Presentation Schedule</span>
            </h2>
            <p className="text-xs text-slate-500">Structured allocation of time across Review 3 criteria</p>
          </div>
          <span className="text-xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-md">
            15 Minutes Total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Time Window</th>
                <th className="px-6 py-3">Topic / Milestone</th>
                <th className="px-6 py-3">Key Technical Evidence to Present</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {presentationTimeline.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold font-mono text-brand-700 bg-brand-50/30">{item.time}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{item.title}</td>
                  <td className="px-6 py-3.5 text-slate-700">{item.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
