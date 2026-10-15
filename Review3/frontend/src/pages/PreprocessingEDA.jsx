import React from 'react';
import { 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  BarChart2, 
  CheckCircle2, 
  FileCode,
  Tag,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';
import { 
  MOCK_EDA_METRICS, 
  MOCK_PRICE_AVAILABILITY, 
  MOCK_TIME_SERIES 
} from '../data/mockData';

export default function PreprocessingEDA() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 2 of 8
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Preprocessing and Exploratory Data Analysis (EDA)
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Deep structural exploration of the multi-echelon retail catalog prior to model training. 
          Uncovers critical retail characteristics including <strong>73.0% intermittent zero-sales</strong>, 
          product-launch price availability dynamics, and regional store demand distributions.
        </p>
      </div>

      {/* Two-Column Overview Tables (Identical layout to Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Table: Dataset Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Dataset Overview</h2>
            <span className="text-[11px] font-mono text-slate-500">505,032 Total Daily Records</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-2.5">Measure</th>
                <th className="px-5 py-2.5 text-right">Value</th>
                <th className="px-5 py-2.5 text-right">Share of Rows</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_EDA_METRICS.measures.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-2.5 text-slate-900 flex items-center justify-between">
                    <span>{m.measure}</span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                      {m.badge}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono font-semibold text-slate-900">{m.value}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-slate-600">{m.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Table: Store Demand Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Sales Distribution by Store Location</h2>
            <span className="text-[11px] font-mono text-slate-500">10 Walmart Supercenters</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-2.5">Store Identifier</th>
                <th className="px-5 py-2.5">State Region</th>
                <th className="px-5 py-2.5 text-right">Units Sold</th>
                <th className="px-5 py-2.5 text-right">Share</th>
                <th className="px-5 py-2.5">Distribution Meter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_EDA_METRICS.storeDistribution.map((store, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-2.5 font-bold font-mono text-slate-900">{store.store}</td>
                  <td className="px-5 py-2.5 text-slate-600">
                    {store.store.startsWith('CA') ? 'California' : store.store.startsWith('TX') ? 'Texas' : 'Wisconsin'}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono font-semibold text-slate-900">{store.sales.toLocaleString()}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-slate-600">{store.share}</td>
                  <td className="px-5 py-2.5">
                    <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-600 h-full rounded-full" 
                        style={{ width: `${parseFloat(store.share) * 4}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing Price & Product Availability Analysis */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Missing Price Semantics: Product Age Availability Lifecycle</span>
            </h2>
            <p className="text-xs text-slate-500">
              Analysis proving that missing weekly prices represent unlaunched/discontinued items rather than data corruption
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            Signal Identified
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Product Age Bucket</th>
                <th className="px-6 py-3 text-right">Total Daily Rows</th>
                <th className="px-6 py-3 text-right">Unavailable (No Price)</th>
                <th className="px-6 py-3 text-right">Unavailable Rate (%)</th>
                <th className="px-6 py-3">Analytical Interpretation & Treatment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {MOCK_PRICE_AVAILABILITY.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{row.age_bucket}</td>
                  <td className="px-6 py-3.5 text-right font-mono">{row.rows.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-amber-700 font-semibold">{row.unavailable_rows.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-right font-mono font-bold text-slate-900">
                    <span className={`px-2 py-0.5 rounded ${
                      row.unavailable_rate > 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.unavailable_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-700">{row.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizations: Sales Trend & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Demand Trend (Test Evaluation Window)</h3>
              <p className="text-xs text-slate-500">Actual sales units vs rolling moving average across 28-day window</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              March 28 – April 24, 2016
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TIME_SERIES}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Area type="monotone" dataKey="actual" name="Actual Daily Demand" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="ma" name="28-Day Baseline Mean" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top 8 SKUs by Volume</h3>
              <p className="text-xs text-slate-500">Cumulative sales units</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_EDA_METRICS.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{fontSize: 10}} stroke="#94a3b8" />
                <YAxis dataKey="item_id" type="category" tick={{fontSize: 9}} stroke="#94a3b8" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="total_sales" name="Total Units Sold" fill="#ea580c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preprocessing Report (Terminal Style - Identical to Image 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-brand-600" />
            <span>Preprocessing Pipeline Execution Report (Review 2 & 3)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">analytics/preprocess.py</span>
        </div>
        <div className="terminal-box">
          <pre className="text-slate-300">
{`================================================================================
RETAIL DEMAND LAB - PREPROCESSING REPORT (STAGES APPLIED TO REAL-WORLD DATA)
================================================================================
Raw rows read: sales=505,032 | prices=204,234 | calendar=1,969
Output clean integrated rows kept: 505,032 daily observations

STAGE 1: Cleaning & Schema Validation
  - Verified non-negative quantities; 368,912 legitimate zero-demand sales retained.
  - Trimmed whitespace, normalized store IDs (CA_1..WI_3) and item IDs (HOBBIES_1_001..030).
  - Validated calendar dates ranging from 2011-02-26 to 2016-04-24.

STAGE 2: Deduplication & Consistency
  - Composite key (item_id + store_id + date) checked: 0 duplicate rows removed.
  - Price table composite key (store_id + item_id + wm_yr_wk) verified unique.

STAGE 3: Distributed Data Integration (Three-Way Join)
  - Sales RDD inner joined with Calendar RDD on 'd' (day index): 0 unmatched rows.
  - Joined with Price RDD on (store_id, item_id, wm_yr_wk):
      * 96,789 rows (19.16%) had no matching price.
      * Product-age analysis confirmed missingness corresponds to unlaunched periods.
      * Added binary flag: is_available = (price != null).
      * Forward-filled item median shelf price for model numerical stability.

STAGE 4: Temporal Feature Engineering (No Future Data Leakage)
  - Generated lag features: lag_1, lag_7, lag_28.
  - Generated rolling statistics over historical partitions: rolling_7, rolling_28.
  - Extracted cyclic calendar features: day_of_week (1-7), month_num (1-12), is_event (0/1).
  - Feature matrix output: 497,640 complete rows (first 28 days reserved for lag priming).`}
          </pre>
        </div>
      </div>
    </div>
  );
}
