import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Filter, 
  DollarSign, 
  ShieldAlert, 
  Package, 
  ArrowUpRight,
  Info,
  Sliders
} from 'lucide-react';
import { 
  MOCK_DECISIONS, 
  MOCK_SPIKES 
} from '../data/mockData';

export default function ConcludeDecision({ decisionData, spikeData }) {
  const decisions = decisionData && decisionData.length > 0 ? decisionData : MOCK_DECISIONS;
  const spikes = spikeData && spikeData.length > 0 ? spikeData : MOCK_SPIKES;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [minUplift, setMinUplift] = useState(10);
  const [selectedItem, setSelectedItem] = useState(decisions[0] || null);

  const filteredDecisions = decisions.filter((d) => {
    const matchesSearch = d.item_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.store_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || d.recommendation.toLowerCase().includes(filterType.toLowerCase());
    const matchesUplift = d.uplift_pct >= minUplift;
    return matchesSearch && matchesFilter && matchesUplift;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Conclude the Analysis Decision: Supply Chain Inventory Triggers
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Operationalizing machine learning outputs into automated <strong>Inventory Reorder Decisions</strong>. 
          Products exhibiting forecast demand uplifts &gt; 10% above recent moving averages are flagged with 
          prioritized procurement triggers stored directly in the HBase serving layer.
        </p>
      </div>

      {/* Decision Impact Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Stockout Risk Reduction</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">34.2%</p>
          <p className="mt-1 text-xs text-slate-500">Simulated reduction in lost sales</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">High-Uplift Triggers Flagged</span>
          <p className="mt-2 text-2xl font-extrabold text-brand-600">25 SKUs</p>
          <p className="mt-1 text-xs text-slate-500">&gt; 10% 7-day projected surge</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Revenue Protected</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">$18,420</p>
          <p className="mt-1 text-xs text-slate-500">Across test evaluation window</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Overstocking Avoided</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-700">14 SKUs</p>
          <p className="mt-1 text-xs text-slate-500">De-prioritized slow moving items</p>
        </div>
      </div>

      {/* Search & Filter Controls (Inspired directly by Image 5) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by product SKU or store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Min Uplift Slider */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Sliders className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-xs text-slate-600 font-medium">Min Uplift:</span>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={minUplift}
              onChange={(e) => setMinUplift(Number(e.target.value))}
              className="w-24 accent-brand-600"
            />
            <span className="text-xs font-mono font-bold text-brand-700">{minUplift}%</span>
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-700"
          >
            <option value="all">All Recommendations</option>
            <option value="Urgent">Urgent Reorder Uplift (&gt; 50%)</option>
            <option value="Moderate">Moderate Reorder (25-50%)</option>
            <option value="Monitor">Monitor (10-25%)</option>
            <option value="Adequate">Adequate Stock (&lt; 10%)</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {filteredDecisions.length} qualifying decisions
        </span>
      </div>

      {/* Main Table + Item Detail Side Card (Image 5 layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Decisions Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">
              HBase Inventory Decision Matrix (<code className="font-mono text-xs">user_decisions</code> table)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">REST Gateway Sync</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">Product SKU</th>
                  <th className="px-4 py-2.5">Store</th>
                  <th className="px-4 py-2.5">Forecast Uplift (%)</th>
                  <th className="px-4 py-2.5 text-right">Recent 7d</th>
                  <th className="px-4 py-2.5 text-right">ML Forecast 7d</th>
                  <th className="px-4 py-2.5 text-right">Value Signal</th>
                  <th className="px-4 py-2.5">Action Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDecisions.map((d, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedItem(d)}
                    className={`cursor-pointer transition-colors ${
                      selectedItem?.item_id === d.item_id ? 'bg-brand-50/70 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{d.item_id}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{d.store_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              d.uplift_pct > 50 ? 'bg-red-500' : d.uplift_pct > 25 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(10, d.uplift_pct))}%` }}
                          ></div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">+{d.uplift_pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{d.recent_7d.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-brand-700">{d.forecast_7d.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">{d.forecast_value}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.action_color === 'red' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : d.action_color === 'amber'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : d.action_color === 'blue'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {d.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Selected Item Drill-Down Card (Image 5 style) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Item Analysis</span>
            <h3 className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
              {selectedItem ? selectedItem.item_id : 'Select an Item'}
            </h3>
            <p className="text-xs text-slate-500">Store location: {selectedItem?.store_id || 'CA_1'}</p>
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Projected 7-Day Surge:</span>
                  <span className="font-bold font-mono text-red-600">+{selectedItem.uplift_pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weekly Forecast Value:</span>
                  <span className="font-bold font-mono text-slate-900">{selectedItem.forecast_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Spike Anomaly Score:</span>
                  <span className="font-bold font-mono text-amber-700">{selectedItem.spike_score} σ</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">Operational Recommendation</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Generate immediate purchase order for{' '}
                  <strong>{Math.ceil(selectedItem.forecast_7d - selectedItem.recent_7d + 5)} buffer units</strong>. 
                  Shipment lead time is 2 business days. Advance procurement mitigates stockout risk during the impending 
                  demand peak.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-400">HBase Row Key:</span>
                <p className="text-[11px] font-mono bg-slate-100 text-slate-800 p-2 rounded mt-1 break-all">
                  dec:{selectedItem.store_id}:{selectedItem.item_id}:2016-04-24
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Click an item in the table to view supply chain action.</p>
          )}
        </div>
      </div>

      {/* Demand Spike Anomaly Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Flagged Demand Spikes & Anomaly Explanations</span>
            </h2>
            <p className="text-xs text-slate-500">
              Poisson count-aware spike detector identifying genuine buying surges vs intermittent noise
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-md">
            5 Validated Surges
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Event Date</th>
                <th className="px-6 py-3">Product SKU</th>
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3 text-right">Actual Spike Units</th>
                <th className="px-6 py-3 text-right">Expected Mean</th>
                <th className="px-6 py-3 text-right">Surge Score</th>
                <th className="px-6 py-3">Derived Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono">
              {spikes.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 text-slate-900">{s.date}</td>
                  <td className="px-6 py-3.5 font-bold text-brand-700">{s.item_id}</td>
                  <td className="px-6 py-3.5 text-slate-700">{s.store_id}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-red-600">{s.sales} units</td>
                  <td className="px-6 py-3.5 text-right text-slate-600">{s.expected_sales}</td>
                  <td className="px-6 py-3.5 text-right font-bold text-amber-700">{s.spike_score}</td>
                  <td className="px-6 py-3.5 text-slate-600 font-sans">{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
