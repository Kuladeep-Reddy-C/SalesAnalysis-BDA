import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Datasets from './pages/Datasets';
import PreprocessingEDA from './pages/PreprocessingEDA';
import ResultsVisualization from './pages/ResultsVisualization';
import ConcludeDecision from './pages/ConcludeDecision';
import MLModelSelection from './pages/MLModelSelection';
import PerformanceAnalysis from './pages/PerformanceAnalysis';

import { 
  MOCK_SUMMARY, 
  MOCK_MODEL_METRICS, 
  MOCK_DECISIONS, 
  MOCK_SPIKES 
} from './data/mockData';

const HASH_MAP = {
  '#datasets': 'datasets',
  '#dataset': 'datasets',
  '#realtime': 'datasets',
  '#eda': 'preprocessing-eda',
  '#preprocessing': 'preprocessing-eda',
  '#results': 'results-visualisation',
  '#visualisation': 'results-visualisation',
  '#visualizations': 'results-visualisation',
  '#model': 'ml-model-selection',
  '#ml': 'ml-model-selection',
  '#performance': 'performance-analysis',
  '#decision': 'conclude-decision',
  '#decisions': 'conclude-decision',
  '#conclusion': 'conclude-decision'
};

const TAB_TO_HASH = {
  'datasets': '#datasets',
  'preprocessing-eda': '#eda',
  'results-visualisation': '#results',
  'ml-model-selection': '#model',
  'performance-analysis': '#performance',
  'conclude-decision': '#decision'
};

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return HASH_MAP[window.location.hash.toLowerCase()] || 'datasets';
    }
    return 'datasets';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (typeof window !== 'undefined') {
      window.location.hash = TAB_TO_HASH[tabId] || '#datasets';
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash && HASH_MAP[window.location.hash.toLowerCase()]) {
        setActiveTabState(HASH_MAP[window.location.hash.toLowerCase()]);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Live data states
  const [summaryData, setSummaryData] = useState(MOCK_SUMMARY);
  const [metricsData, setMetricsData] = useState(MOCK_MODEL_METRICS);
  const [decisionData, setDecisionData] = useState(MOCK_DECISIONS);
  const [spikeData, setSpikeData] = useState(MOCK_SPIKES);

  const fetchLiveBackend = async () => {
    setIsRefreshing(true);
    try {
      // 1. Check Backend Status
      const statusRes = await fetch('/backend-status');
      if (statusRes.ok) {
        const status = await statusRes.json();
        setIsLiveConnected(status.hbase?.connected || status.active_backend === 'hbase' || status.sqlite_available);
      }

      // 2. Fetch Run Summary
      try {
        const sumRes = await fetch('/run-summary');
        if (sumRes.ok) {
          const sum = await sumRes.json();
          setSummaryData(prev => ({ ...prev, ...sum }));
        }
      } catch (e) {
        // fallback
      }

      // 3. Fetch Metrics
      try {
        const metRes = await fetch('/metrics');
        if (metRes.ok) {
          const met = await metRes.json();
          if (Array.isArray(met) && met.length > 0) {
            const formatted = met.map(m => ({
              ...m,
              is_champion: m.model?.includes('gradient') || m.model?.includes('gbt'),
              status: m.model?.includes('gradient') ? 'Champion Model' : 'Challenger Model'
            }));
            setMetricsData(formatted);
          }
        }
      } catch (e) {
        // fallback
      }

      // 4. Fetch Decisions
      try {
        const decRes = await fetch('/decisions?limit=100');
        if (decRes.ok) {
          const dec = await decRes.json();
          if (Array.isArray(dec) && dec.length > 0) {
            setDecisionData(dec);
          }
        }
      } catch (e) {
        // fallback
      }

      // 5. Fetch Spikes
      try {
        const spkRes = await fetch('/spikes?limit=50');
        if (spkRes.ok) {
          const spk = await spkRes.json();
          if (Array.isArray(spk) && spk.length > 0) {
            setSpikeData(spk);
          }
        }
      } catch (e) {
        // fallback
      }
    } catch (err) {
      console.warn("Backend not reachable; running with precomputed Review 3 results.", err);
      setIsLiveConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveBackend();
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'datasets':
        return <Datasets summaryData={summaryData} />;
      case 'preprocessing-eda':
        return <PreprocessingEDA />;
      case 'results-visualisation':
        return <ResultsVisualization />;
      case 'conclude-decision':
        return <ConcludeDecision decisionData={decisionData} spikeData={spikeData} />;
      case 'ml-model-selection':
        return <MLModelSelection metricsData={metricsData} />;
      case 'performance-analysis':
        return <PerformanceAnalysis />;
      default:
        return <Datasets summaryData={summaryData} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased font-['Inter',sans-serif]">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        isLiveConnected={isLiveConnected}
        onRefresh={fetchLiveBackend}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 space-y-3 sm:space-y-0">
          <div>
            <span className="font-bold text-slate-700">Retail Demand Lab</span> — 23CSE352 Big Data Analytics Project
          </div>
          <div className="flex items-center space-x-4">
            <span>PySpark 3.5.9</span>
            <span>•</span>
            <span>PySpark MLlib</span>
            <span>•</span>
            <span>Apache HBase 2.x</span>
            <span>•</span>
            <span>FastAPI + React 19</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
