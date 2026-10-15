import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Image as ImageIcon, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  Layers, 
  Filter,
  Maximize2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  MOCK_TIME_SERIES, 
  MOCK_HORIZON_METRICS 
} from '../data/mockData';

export default function ResultsVisualization() {
  const [selectedModel, setSelectedModel] = useState('all');
  const [activeChartTab, setActiveChartTab] = useState('interactive');

  const staticCharts = [
    { title: "Actual vs Predicted Sales Timeline", file: "/charts/actual_vs_predicted.png", desc: "Holdout test set forecast tracking against ground truth demand" },
    { title: "Model Performance Benchmark", file: "/charts/model_performance.png", desc: "Comparative WAPE, MAE, and RMSE across tree ensembles and baselines" },
    { title: "Demand Spikes & Anomaly Detection", file: "/charts/demand_spikes.png", desc: "Flagged demand surges exceeding Poisson and moving threshold confidence" },
    { title: "Daily Sales Trend (5.4 Years)", file: "/charts/daily_sales_trend.png", desc: "Longitudinal retail demand with holiday seasonality and annual cyclicity" },
    { title: "Price vs Sales Volume Elasticity", file: "/charts/price_vs_sales.png", desc: "Demand sensitivity across unit shelf prices and promotional tiers" },
    { title: "Top Products Velocity Ranking", file: "/charts/top_products.png", desc: "Cumulative units sold across top performing HOBBIES_1 catalog items" },
    { title: "Store Location Comparison", file: "/charts/store_comparison.png", desc: "Regional demand aggregate across 10 supercenters in CA, TX, and WI" }
  ];

  // Calculate residuals for chart
  const residualData = MOCK_TIME_SERIES.map(d => ({
    date: d.date,
    gbt_res: (d.actual - d.gbt).toFixed(1),
    rf_res: (d.actual - d.rf).toFixed(1),
    dt_res: (d.actual - d.dt).toFixed(1)
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 5 of 8
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Display Results with Interactive & Visual Analytics
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Comprehensive visual evaluation comparing actual retail sales demand against machine learning 
          predictions, residual error distributions over time, multi-step rolling horizons, and pipeline analytical artifacts.
        </p>
      </div>

      {/* Chart Mode Switcher */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveChartTab('interactive')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeChartTab === 'interactive' 
                ? 'bg-brand-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Interactive Multi-Model Timeline & Residuals</span>
          </button>
          <button
            onClick={() => setActiveChartTab('gallery')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeChartTab === 'gallery' 
                ? 'bg-brand-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Generated Analytical Chart Gallery (7 Visuals)</span>
          </button>
        </div>

        {activeChartTab === 'interactive' && (
          <div className="flex items-center space-x-2 pr-2">
            <span className="text-xs text-slate-500 font-medium">Model Filter:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-700"
            >
              <option value="all">All Models (GBT, RF, DT, MA)</option>
              <option value="champion">GBT Champion vs Actual</option>
              <option value="ensembles">Tree Ensembles (GBT & RF)</option>
            </select>
          </div>
        )}
      </div>

      {activeChartTab === 'interactive' ? (
        <div className="space-y-6">
          {/* Main Interactive Forecast Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Actual Demand vs ML Ensembles (Test Evaluation Period)
                </h2>
                <p className="text-xs text-slate-500">
                  Daily aggregated units sold across 30 items in store CA_1 (March 28 to April 24, 2016)
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 font-medium text-slate-600">
                  <span className="w-3 h-3 rounded-full bg-slate-900"></span>
                  <span>Actual Demand</span>
                </span>
                <span className="flex items-center space-x-1.5 font-medium text-brand-600">
                  <span className="w-3 h-3 rounded-full bg-brand-600"></span>
                  <span>GBT (Champion)</span>
                </span>
                <span className="flex items-center space-x-1.5 font-medium text-blue-600">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span>Random Forest</span>
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_TIME_SERIES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" />
                  <YAxis tick={{fontSize: 10}} stroke="#94a3b8" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Sales (Ground Truth)" 
                    stroke="#0f172a" 
                    strokeWidth={3} 
                    dot={{r: 3}} 
                  />
                  {(selectedModel === 'all' || selectedModel === 'champion' || selectedModel === 'ensembles') && (
                    <Line 
                      type="monotone" 
                      dataKey="gbt" 
                      name="Gradient Boosting (Champion)" 
                      stroke="#ea580c" 
                      strokeWidth={2.5} 
                      dot={{r: 2}} 
                    />
                  )}
                  {(selectedModel === 'all' || selectedModel === 'ensembles') && (
                    <Line 
                      type="monotone" 
                      dataKey="rf" 
                      name="Random Forest Regressor" 
                      stroke="#2563eb" 
                      strokeWidth={2} 
                      strokeDasharray="4 2" 
                    />
                  )}
                  {selectedModel === 'all' && (
                    <Line 
                      type="monotone" 
                      dataKey="dt" 
                      name="Decision Tree (Single)" 
                      stroke="#9333ea" 
                      strokeWidth={1.5} 
                      strokeDasharray="2 2" 
                    />
                  )}
                  {selectedModel === 'all' && (
                    <Line 
                      type="monotone" 
                      dataKey="ma" 
                      name="28-Day Moving Average Baseline" 
                      stroke="#64748b" 
                      strokeWidth={1.5} 
                      strokeDasharray="5 5" 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Residuals Chart (Error Over Time) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Model Prediction Residuals (Actual Demand - Predicted Demand)
                </h3>
                <p className="text-xs text-slate-500">
                  Symmetric error centered at 0 indicates unbiased forecast; positive values represent under-prediction
                </p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={residualData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 9}} stroke="#94a3b8" />
                    <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{fontSize: '11px'}} />
                    <Bar dataKey="gbt_res" name="GBT Residual Error" fill="#ea580c" />
                    <Bar dataKey="rf_res" name="RF Residual Error" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rolling-Origin Horizon Error Degradation */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Forecast Error Degradation Across 1 to 7 Day Horizons
                </h3>
                <p className="text-xs text-slate-500">
                  WAPE comparison: ML ensembles lead in Days 1-4; Moving Average stabilizes in Days 5-7
                </p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_HORIZON_METRICS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="horizon" tick={{fontSize: 9}} stroke="#94a3b8" />
                    <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{fontSize: '11px'}} />
                    <Line type="monotone" dataKey="rf_wape" name="Random Forest WAPE" stroke="#2563eb" strokeWidth={2.5} dot={{r: 3}} />
                    <Line type="monotone" dataKey="ma_wape" name="28-Day MA WAPE" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="naive_wape" name="Seasonal Naive WAPE" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="2 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Static Chart Gallery View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staticCharts.map((chart, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">{chart.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{chart.desc}</p>
              </div>
              <div className="p-3 bg-slate-100 flex items-center justify-center min-h-[220px]">
                <img 
                  src={chart.file} 
                  alt={chart.title}
                  className="max-h-56 max-w-full object-contain rounded border border-slate-200 shadow-2xs"
                  onError={(e) => {
                    // Fallback to placeholder if not loaded
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div class="text-xs text-slate-400 font-mono text-center p-4">Chart generated under results/charts/${chart.file.split('/').pop()}</div>`;
                  }}
                />
              </div>
              <div className="p-3 bg-white text-right">
                <a 
                  href={chart.file} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center space-x-1 text-xs text-brand-600 font-semibold hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Resolution</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
