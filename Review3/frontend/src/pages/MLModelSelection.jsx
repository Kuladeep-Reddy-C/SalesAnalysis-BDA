import React from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { 
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
  MOCK_MODEL_METRICS, 
  MOCK_FEATURE_IMPORTANCE 
} from '../data/mockData';

export default function MLModelSelection({ metricsData }) {
  const models = metricsData && metricsData.length > 0 ? metricsData : MOCK_MODEL_METRICS;

  const comparisonChartData = [
    { name: "Decision Tree", MAE: 1.073, RMSE: 2.432, WAPE: 0.903 },
    { name: "Random Forest", MAE: 1.070, RMSE: 2.425, WAPE: 0.901 },
    { name: "Gradient Boosting (Champ)", MAE: 1.068, RMSE: 2.414, WAPE: 0.899 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 text-xs font-bold bg-brand-100 text-brand-800 rounded-md">
            Step 5 of 6
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Select and Implement Suitable ML Model for Decision
          </h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-4xl leading-relaxed">
          Rigorous benchmarking and selection of distributed <strong>PySpark MLlib regression models</strong>. 
          Evaluates Single Tree vs Bagging (Random Forest) vs Boosting (Gradient Boosted Trees) over 
          482,856 training observations and 7,392 chronological holdout test records.
        </p>
      </div>

      {/* Champion Model Selection Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-amber-600 rounded-xl p-5 text-white shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-xs">
            <Award className="w-8 h-8 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Selected Champion
              </span>
              <h2 className="text-lg font-extrabold">Gradient Boosted Trees (GBTRegressor)</h2>
            </div>
            <p className="mt-1 text-xs text-amber-100 leading-normal max-w-2xl">
              Gradient Boosting wins with the lowest Weighted Absolute Percentage Error (WAPE: <strong>0.8990</strong>) 
              and Mean Absolute Error (MAE: <strong>1.0677</strong>), demonstrating superior ability to fit non-linear retail spikes.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-6 text-right font-mono pr-2">
          <div>
            <span className="text-[10px] uppercase text-amber-200 block">WAPE Score</span>
            <span className="text-2xl font-black">0.8990</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-amber-200 block">Test MAE</span>
            <span className="text-2xl font-black">1.0677</span>
          </div>
        </div>
      </div>

      {/* Main ML Models Evaluation Table (Inspired by Image 4) */}
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
                    m.is_champion ? 'bg-amber-50/60 font-semibold' : 'hover:bg-slate-50/80'
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

      {/* Model Comparison Chart & Feature Importance (Inspired by Image 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Error Comparison Grouped Bar Chart */}
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
                <Bar dataKey="MAE" name="Mean Absolute Error (MAE)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WAPE" name="Weighted Error (WAPE)" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" name="Root Mean Squared (RMSE)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Ranking Chart (Image 4 reference) */}
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
                <Bar dataKey="importance" name="Relative Importance" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {MOCK_FEATURE_IMPORTANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ea580c' : '#3b82f6'} />
                  ))}
                </Bar>
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
            <span>PySpark MLlib Pipeline Implementation (VectorAssembler & GBT)</span>
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
[INFO] Spark MLlib GBT test evaluation: WAPE = 0.9034 | MAE = 1.0729.`}
          </pre>
        </div>
      </div>
    </div>
  );
}
