import React from 'react';
import { Activity, Database, GitBranch, Layers3, RefreshCw, ShieldCheck } from 'lucide-react';

const conceptLabels = [
  ['Transformations', 'map, filter, flatMap, reduceByKey, groupByKey, mapValues, sortByKey'],
  ['Actions', 'first, count, take, collect'],
  ['Persistence', 'cached RDD reused across actions'],
  ['Fault tolerance', 'lineage-based partition recomputation'],
];

export default function RddLab({ data }) {
  const [customNames, setCustomNames] = React.useState(() => {
    try {
      const saved = localStorage.getItem('rdd_lab_custom_names');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const handleNameChange = (id, newName) => {
    setCustomNames((prev) => {
      const updated = { ...prev, [id]: newName };
      try {
        localStorage.setItem('rdd_lab_custom_names', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-700"><Layers3 className="w-5 h-5" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Four-person Spark RDD lab</h1>
            <p className="mt-1 text-sm text-slate-600">One complete RDD workflow per person, with a different retail question and key design.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {conceptLabels.map(([label, detail], index) => {
          const Icon = [Activity, Database, RefreshCw, ShieldCheck][index];
          return <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <Icon className="w-4 h-4 text-brand-600 mb-3" />
            <p className="text-xs font-bold text-slate-900">{label}</p>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{detail}</p>
          </div>;
        })}
      </div>

      {!data ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-900">
          <p className="font-bold">RDD results are not generated yet.</p>
          <p className="mt-2">Run <code className="font-mono">.venv/bin/python run_pipeline.py --rdd-lab</code> to execute all four analyses and make their measured outputs available here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs text-slate-500"><GitBranch className="w-4 h-4" /> {data.engine} · Spark {data.spark_version} · {data.master} · {data.profile_count} profiles</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.profiles.map((profile, index) => (
              <article key={profile.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <input
                      type="text"
                      value={customNames[profile.id] ?? ''}
                      onChange={(e) => handleNameChange(profile.id, e.target.value)}
                      placeholder={`Person ${index + 1}`}
                      className="text-[11px] uppercase tracking-wide font-bold text-brand-600 placeholder:text-brand-400 bg-slate-50/70 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded px-2 py-0.5 outline-none transition-all w-48 block"
                    />
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{profile.title}</h2>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{profile.partitions} partitions</span>
                </div>
                <p className="text-sm text-slate-600 mt-3">{profile.question}</p>
                <p className="text-xs text-slate-500 mt-2">{profile.purpose} Key: <strong>{profile.key_description}</strong></p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Filtered rows</span><strong className="block text-slate-900 mt-1">{profile.input_rows_after_filter.toLocaleString()}</strong></div>
                  <div className="bg-slate-50 rounded-lg p-3"><span className="text-slate-500">Cache</span><strong className="block text-slate-900 mt-1">{profile.concepts.persistence}</strong></div>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mt-5 mb-2">Top key/value output</h3>
                <div className="space-y-1">{profile.top_totals.slice(0, 5).map((item) => <div key={item.key} className="flex justify-between text-xs border-b border-slate-100 py-1.5"><span className="font-mono text-slate-600">{item.key}</span><strong>{Number(item.value).toFixed(1)}</strong></div>)}</div>
                <details className="mt-4"><summary className="text-xs font-bold text-brand-700 cursor-pointer">View lineage and DAG explanation</summary><p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{profile.concepts.dag} {profile.concepts.fault_tolerance}</p><pre className="terminal-box mt-2 text-[10px] max-h-32">{profile.concepts.lineage}</pre></details>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}