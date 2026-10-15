import React from 'react';
import { 
  Database, 
  Layers, 
  BarChart3, 
  CheckCircle2, 
  Binary, 
  Zap, 
  RefreshCw,
  Server
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'datasets',              label: 'Datasets',        icon: Database     },
  { id: 'preprocessing-eda',    label: 'Preprocessing',   icon: Layers       },
  { id: 'results-visualisation', label: 'Visualisation',   icon: BarChart3    },
  { id: 'ml-model-selection',    label: 'ML Models',       icon: Binary       },
  { id: 'performance-analysis',  label: 'Performance',     icon: Zap          },
  { id: 'conclude-decision',     label: 'Conclusion',      icon: CheckCircle2 },
];

export default function Navbar({ activeTab, onSelectTab, isLiveConnected, onRefresh, isRefreshing }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Banner Row */}
        <div className="flex items-center justify-between h-14 border-b border-slate-100">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm shadow-brand-700/20 shrink-0 border border-brand-500/20 bg-slate-900 flex items-center justify-center">
              <img src="/logo.svg" alt="Retail Demand Lab" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                Retail<span className="text-brand-600">Demand</span>Lab
              </span>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                Retail Demand Forecasting · PySpark MLlib
              </p>
            </div>
          </div>

          {/* Right: Engine Status + Refresh */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLiveConnected ? 'bg-emerald-400' : 'bg-brand-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveConnected ? 'bg-emerald-500' : 'bg-brand-500'}`}></span>
              </span>
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {isLiveConnected 
                  ? 'PySpark 3.5.9 · HBase Cluster Live' 
                  : 'PySpark 3.5.9 · Engine Active'}
              </span>
            </div>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh API Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs — 6 items, perfectly fitted in a responsive 6-col grid, zero horizontal scroll */}
        <nav className="w-full py-1.5 overflow-hidden">
          <div className="grid grid-cols-6 gap-1 sm:gap-2 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`flex items-center justify-center space-x-1 sm:space-x-1.5 px-1 sm:px-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 border-b-2 border-brand-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </div>
    </header>
  );
}
