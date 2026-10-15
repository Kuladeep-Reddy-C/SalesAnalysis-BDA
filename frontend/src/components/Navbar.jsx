import React from 'react';
import { 
  Database, 
  Layers, 
  HelpCircle, 
  Cpu, 
  BarChart3, 
  CheckCircle2, 
  Binary, 
  Zap, 
  RefreshCw,
  Server
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'realtime-datasets', num: 1, label: 'Real-time data sets', shortLabel: '1. Datasets', icon: Database },
  { id: 'preprocessing-eda', num: 2, label: 'Preprocessing and EDA', shortLabel: '2. Preprocessing & EDA', icon: Layers },
  { id: 'frame-question', num: 3, label: 'Frame analysis question (15 min)', shortLabel: '3. Frame Question', icon: HelpCircle },
  { id: 'spark-processing', num: 4, label: 'Apply either Spark Scala or PySpark', shortLabel: '4. Spark / PySpark', icon: Cpu },
  { id: 'results-visualisation', num: 5, label: 'Display the results with possible visualisation', shortLabel: '5. Visualisations', icon: BarChart3 },
  { id: 'conclude-decision', num: 6, label: 'Conclude the analysis decision', shortLabel: '6. Decision Support', icon: CheckCircle2 },
  { id: 'ml-model-selection', num: 7, label: 'Select and implement suitable ML model', shortLabel: '7. ML Models', icon: Binary },
  { id: 'performance-analysis', num: 8, label: 'Do the performance analysis', shortLabel: '8. Performance', icon: Zap },
];

export default function Navbar({ activeTab, onSelectTab, isLiveConnected, onRefresh, isRefreshing }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-100">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Retail<span className="text-brand-600">Demand</span>Lab
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-full">
                  Review 3
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Enterprise Big Data Analytics · Apache Spark 3.5.9 · PySpark MLlib · HBase Serving
              </p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isLiveConnected 
                  ? 'HBase Thrift Live (127.0.0.1:9090) · Spark 3.5.9' 
                  : 'Serving Store: SQLite Synchronized · Spark Active'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh API Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - The 8 items */}
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {item.num}
                </span>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
