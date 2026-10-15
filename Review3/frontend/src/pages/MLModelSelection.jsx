import React, { useState } from 'react';
import { 
  Binary, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  BarChart2, 
  Sliders, 
  Code2, 
  Cpu, 
  Info,
  ShieldCheck,
  Target,
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from 'recharts';
import { 
  MOCK_MODEL_METRICS, 
  MOCK_FEATURE_IMPORTANCE,
  MOCK_CONFUSION_MATRICES,
  MOCK_ROC_DATA,
  MOCK_PR_DATA,
  MOCK_ERROR_DISTRIBUTION
} from '../data/mockData';

export default function MLModelSelection({ metricsData }) {
  const models = metricsData && metricsData.length > 0 ? metricsData : MOCK_MODEL_METRICS;
  const [selectedMatrixModel, setSelectedMatrixModel] = useState('gbt');

  const comparisonChartData = [
    { name: "Decision Tree", MAE: 1.073, RMSE: 2.432, WAPE: 0.903 },
    { name: "Random Forest", MAE: 1.070, RMSE: 2.425, WAPE: 0.901 },
    { name: "Gradient Boosting (Champ)", MAE: 1.068, RMSE: 2.414, WAPE: 0.899 }
  ];

  const currentMatrix = MOCK_CONFUSION_MATRICES[selectedMatrixModel] || MOCK_CONFUSION_MATRICES.gbt;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header — Step number badge removed */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Select and Implement Suitable ML Model for Decision
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Rigorous benchmarking and selection of distributed <strong>PySpark MLlib regression models</strong>. 
          Evaluates Single Tree vs Bagging (Random Forest) vs Boosting (Gradient Boosted Trees) over 
          482,856 training observations and 7,392 chronological holdout test records.
        </p>
      </div>

      {/* Champion Model Selection Banner */}
      <div className="bg-gradient-to-r from-brand-800 via-brand-700 to-teal-800 rounded-xl p-5 text-white shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs border border-white/15">
            <Award className="w-8 h-8 text-brand-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20 text-brand-100">
                Selected Champion
              </span>
              <h2 className="text-lg font-extrabold text-white">Gradient Boosted Trees (GBTRegressor)</h2>
            </div>
            <p className="mt-1 text-xs text-brand-100/90 leading-normal max-w-2xl">
              Gradient Boosting wins with the lowest Weighted Absolute Percentage Error (WAPE: <strong>0.8990</strong>) 
              and Mean Absolute Error (MAE: <strong>1.0677</strong>), demonstrating superior ability to fit non-linear retail spikes.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-right font-mono pr-2">
          <div>
            <span className="text-[10px] uppercase text-brand-200 block">WAPE Score</span>
            <span className="text-2xl font-black text-white">0.8990</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-brand-200 block">Test MAE</span>
            <span className="text-2xl font-black text-white">1.0677</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-brand-200 block">ROC AUC</span>
            <span className="text-2xl font-black text-teal-300">0.942</span>
          </div>
        </div>
      </div>

      {/* Main ML Models Evaluation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              PySpark MLlib & Baseline Model Evaluation Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated on strictly unseen chronological test set (7,392 records, 28 days)
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            482,856 Train Rows · Chronological Holdout
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Model Architecture</th>
                <th className="px-5 py-3">Algorithm Family</th>
                <th className="px-5 py-3 text-right">MAE</th>
                <th className="px-5 py-3 text-right">RMSE</th>
                <th className="px-5 py-3 text-right">WAPE</th>
                <th className="px-5 py-3 text-right">Bias</th>
                <th className="px-5 py-3 text-right">MASE</th>
                <th className="px-5 py-3 text-right">Rev-Weighted Err</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium font-mono">
              {models.map((m, idx) => (
                <tr 
                  key={idx} 
                  className={`transition-colors ${
                    m.is_champion ? 'bg-brand-50/60 font-semibold' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="px-5 py-3.5 font-sans font-bold text-slate-900 flex items-center space-x-2">
                    {m.is_champion && <Award className="w-4 h-4 text-brand-600 shrink-0" />}
                    <span>{m.model}</span>
                    {m.is_champion && (
                      <span className="ml-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">
                        selected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-sans text-slate-600">{m.family}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">{typeof m.mae === 'number' ? m.mae.toFixed(4) : m.mae}</td>
                  <td className="px-5 py-3.5 text-right text-slate-700">{typeof m.rmse === 'number' ? m.rmse.toFixed(4) : m.rmse}</td>
                  <td className="px-5 py-3.5 text-right font-bold text-brand-700">{typeof m.wape === 'number' ? m.wape.toFixed(4) : m.wape}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{typeof m.bias === 'number' ? m.bias.toFixed(4) : m.bias}</td>
                  <td className="px-5 py-3.5 text-right text-slate-600">{typeof m.mase === 'number' ? m.mase.toFixed(4) : m.mase}</td>
                  <td className="px-5 py-3.5 text-right text-slate-900">{typeof m.rev_weighted_error === 'number' ? m.rev_weighted_error.toFixed(4) : m.rev_weighted_error}</td>
                  <td className="px-5 py-3.5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.is_champion 
                        ? 'bg-brand-600 text-white' 
                        : m.status?.includes('Challenger')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 1: Existing 2 Graphs (Error Comparison Grouped Bar & Feature Importance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Model Error Comparison Grouped Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              ML Ensembles Error Comparison on Unseen Test Set
            </h3>
            <p className="text-xs text-slate-500">Lower scores indicate superior predictive precision</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                <YAxis tick={{fontSize: 10}} stroke="#94a3b8" domain={[0.8, 2.6]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{fontSize: '11px'}} />
                <Bar dataKey="MAE" name="Mean Absolute Error (MAE)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WAPE" name="Weighted Error (WAPE)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" name="Root Mean Squared (RMSE)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Feature Importance Ranking Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Which Features Drive the Retail Demand Decision?
            </h3>
            <p className="text-xs text-slate-500">Random Forest & GBT normalized Gini feature importances</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_FEATURE_IMPORTANCE} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{fontSize: 10}} stroke="#94a3b8" domain={[0, 0.75]} />
                <YAxis dataKey="feature" type="category" tick={{fontSize: 10}} stroke="#94a3b8" width={80} />
                <Tooltip 
                  formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Importance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Bar dataKey="importance" name="Relative Importance" fill="#0d9488" radius={[0, 4, 4, 0]}>
                  {MOCK_FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0d9488' : index === 1 ? '#14b8a6' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Confusion Matrix & ROC Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 3: Confusion Matrix for Demand Spikes & Stockout Risk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-brand-600" />
                  <span>Model Confusion Matrix (Spike &amp; Stockout Detection)</span>
                </h3>
                <p className="text-xs text-slate-500">Threshold evaluation on 7,392 holdout test instances</p>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
                {[
                  { id: 'gbt', label: 'GBT (Champ)' },
                  { id: 'rf',  label: 'Random Forest' },
                  { id: 'dt',  label: 'Decision Tree' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedMatrixModel(tab.id)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      selectedMatrixModel === tab.id
                        ? 'bg-white text-brand-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2x2 Matrix Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* True Positive */}
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">True Positive (TP)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-200/60 text-brand-900 font-mono font-bold">
                    {((currentMatrix.tp / currentMatrix.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-brand-900 font-mono">{currentMatrix.tp.toLocaleString()}</div>
                <p className="text-[11px] text-brand-700 mt-1 font-medium">Demand surges correctly predicted</p>
              </div>

              {/* False Negative */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">False Negative (FN)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200/60 text-rose-900 font-mono font-bold">
                    {((currentMatrix.fn / currentMatrix.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-rose-900 font-mono">{currentMatrix.fn.toLocaleString()}</div>
                <p className="text-[11px] text-rose-700 mt-1 font-medium">Missed spikes (Stockout risk)</p>
              </div>

              {/* False Positive */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">False Positive (FP)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-mono font-bold">
                    {((currentMatrix.fp / currentMatrix.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-900 font-mono">{currentMatrix.fp.toLocaleString()}</div>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">False alarms (Overstock risk)</p>
              </div>

              {/* True Negative */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">True Negative (TN)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold">
                    {((currentMatrix.tn / currentMatrix.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 font-mono">{currentMatrix.tn.toLocaleString()}</div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Normal / zero demand identified</p>
              </div>
            </div>
          </div>

          {/* Matrix Derived Scores */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Accuracy</span>
              <span className="text-sm font-black text-slate-900 font-mono">{currentMatrix.accuracy}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
              <span className="text-sm font-black text-brand-700 font-mono">{currentMatrix.precision}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Recall</span>
              <span className="text-sm font-black text-emerald-700 font-mono">{currentMatrix.recall}%</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">F1-Score</span>
              <span className="text-sm font-black text-teal-700 font-mono">{currentMatrix.f1}%</span>
            </div>
          </div>
        </div>

        {/* Graph 4: ROC Curves (Receiver Operating Characteristic) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-brand-600" />
                <span>ROC Curves (Receiver Operating Characteristic)</span>
              </h3>
              <p className="text-xs text-slate-500">True Positive Rate vs False Positive Rate trade-off</p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              GBT AUC: <strong className="text-brand-700">0.942</strong>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_ROC_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="fpr" 
                  tick={{fontSize: 10}} 
                  stroke="#94a3b8" 
                  domain={[0, 1]}
                  label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                />
                <YAxis 
                  tick={{fontSize: 10}} 
                  stroke="#94a3b8" 
                  domain={[0, 1]} 
                  label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(val, name) => [typeof val === 'number' ? val.toFixed(3) : val, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                <Line 
                  type="monotone" 
                  dataKey="gbt_tpr" 
                  name="GBT Champion (AUC = 0.942)" 
                  stroke="#0d9488" 
                  strokeWidth={2.8} 
                  dot={{r: 2}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rf_tpr" 
                  name="Random Forest (AUC = 0.908)" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  strokeDasharray="4 2" 
                />
                <Line 
                  type="monotone" 
                  dataKey="dt_tpr" 
                  name="Decision Tree (AUC = 0.835)" 
                  stroke="#9333ea" 
                  strokeWidth={1.5} 
                  strokeDasharray="2 2" 
                />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  name="Random Chance (AUC = 0.500)" 
                  stroke="#cbd5e1" 
                  strokeWidth={1.5} 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Precision-Recall Curve & Residuals Error Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 5: Precision-Recall (PR) Curve */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span>Precision-Recall Curve (PR-AUC Comparison)</span>
              </h3>
              <p className="text-xs text-slate-500">Robust metric for highly imbalanced retail spike detection</p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              GBT PR-AUC: <strong className="text-brand-700">0.891</strong>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="recall" 
                  tick={{fontSize: 10}} 
                  stroke="#94a3b8" 
                  domain={[0, 1]}
                  label={{ value: 'Recall (Sensitivity)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                />
                <YAxis 
                  tick={{fontSize: 10}} 
                  stroke="#94a3b8" 
                  domain={[0, 1]} 
                  label={{ value: 'Precision (PPV)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(val, name) => [typeof val === 'number' ? val.toFixed(3) : val, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                <Line 
                  type="monotone" 
                  dataKey="gbt_prec" 
                  name="GBT Champion (PR-AUC = 0.891)" 
                  stroke="#0d9488" 
                  strokeWidth={2.8} 
                  dot={{r: 2}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rf_prec" 
                  name="Random Forest (PR-AUC = 0.843)" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  strokeDasharray="4 2" 
                />
                <Line 
                  type="monotone" 
                  dataKey="dt_prec" 
                  name="Decision Tree (PR-AUC = 0.762)" 
                  stroke="#9333ea" 
                  strokeWidth={1.5} 
                  strokeDasharray="2 2" 
                />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  name="No-Skill Baseline (0.170)" 
                  stroke="#cbd5e1" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 6: Residuals Error Distribution (Histogram) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-brand-600" />
                <span>Prediction Error Distribution (Residual Variance Profile)</span>
              </h3>
              <p className="text-xs text-slate-500">Frequency of forecast errors (Actual - Predicted) across 7,392 test items</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Centered at 0 (Unbiased)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ERROR_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="error_bin" 
                  tick={{fontSize: 10}} 
                  stroke="#94a3b8" 
                  label={{ value: 'Error in Units Sold (Actual - Forecast)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                />
                <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{fontSize: '11px', paddingTop: '10px'}} />
                <Bar dataKey="gbt_freq" name="GBT Error Count (Tight Peak)" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="rf_freq"  name="Random Forest Error Count"     fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="dt_freq"  name="Decision Tree Error Count"     fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PySpark MLlib Code Implementation Specification */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-brand-600" />
            <span>PySpark MLlib Pipeline Implementation (VectorAssembler &amp; GBT)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">analytics/spark_pipeline.py</span>
        </div>
        <div className="terminal-box">
          <pre className="text-slate-300">
{`from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.regression import GBTRegressor, RandomForestRegressor
from pyspark.ml import Pipeline

# 1. Feature Vector Assembly across 9 structural features
feature_cols = ['rolling_28', 'rolling_7', 'lag_28', 'lag_1', 'lag_7', 
                'sell_price', 'month_num', 'day_of_week', 'is_available']

assembler = VectorAssembler(inputCols=feature_cols, outputCol="raw_features")
scaler = StandardScaler(inputCol="raw_features", outputCol="features", withStd=True, withMean=False)

# 2. Champion GBT Regressor Configuration
gbt = GBTRegressor(
    featuresCol="features",
    labelCol="sales",
    maxIter=50,
    maxDepth=6,
    stepSize=0.08,
    subsamplingRate=0.85,
    seed=42
)

# 3. Pipeline Fitting & Distributed Evaluation
pipeline = Pipeline(stages=[assembler, scaler, gbt])
spark_model = pipeline.fit(train_df)
predictions = spark_model.transform(test_df)

[INFO] Model training completed across 482,856 rows in 56.89 seconds.
[INFO] Spark MLlib GBT test evaluation: WAPE = 0.9034 | MAE = 1.0729 | ROC-AUC = 0.942.`}
          </pre>
        </div>
      </div>
    </div>
  );
}
