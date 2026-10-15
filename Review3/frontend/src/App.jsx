import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RealTimeDatasets from './pages/RealTimeDatasets';
import PreprocessingEDA from './pages/PreprocessingEDA';
import FrameAnalysisQuestion from './pages/FrameAnalysisQuestion';
import SparkProcessing from './pages/SparkProcessing';
import ResultsVisualization from './pages/ResultsVisualization';
import ConcludeDecision from './pages/ConcludeDecision';
import MLModelSelection from './pages/MLModelSelection';
import PerformanceAnalysis from './pages/PerformanceAnalysis';

import { 
  MOCK_SUMMARY, 
  MOCK_MODEL_METRICS, 
  MOCK_DECISIONS, 
  MOCK_SPIKES, 
  MOCK_STREAM_MICROBATCHES 
} from './data/mockData';

const HASH_MAP = {
  '#realtime': 'realtime-datasets',
  '#datasets': 'realtime-datasets',
  '#eda': 'preprocessing-eda',
  '#preprocessing': 'preprocessing-eda',
  '#question': 'frame-question',
  '#spark': 'spark-processing',
  '#results': 'results-visualisation',
  '#visualisation': 'results-visualisation',
  '#decision': 'conclude-decision',
  '#decisions': 'conclude-decision',
  '#suspects': 'conclude-decision',
  '#model': 'ml-model-selection',
  '#ml': 'ml-model-selection',
  '#performance': 'performance-analysis'
};

const TAB_TO_HASH = {
  'realtime-datasets': '#realtime',
  'preprocessing-eda': '#eda',
  'frame-question': '#question',
  'spark-processing': '#spark',
  'results-visualisation': '#results',
  'conclude-decision': '#decision',
  'ml-model-selection': '#model',
  'performance-analysis': '#performance'
};

export default function App() {
  const getInitialTab = () => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return HASH_MAP[window.location.hash.toLowerCase()] || 'realtime-datasets';
    }
    return 'realtime-datasets';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    if (typeof window !== 'undefined') {
      window.location.hash = TAB_TO_HASH[tabId] || '#realtime';
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
  const [streamData, setStreamData] = useState(MOCK_STREAM_MICROBATCHES);

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
        // use fallback
      }

      // 3. Fetch Metrics
      try {
        const metRes = await fetch('/metrics');
        if (metRes.ok) {
          const met = await metRes.json();
          if (Array.isArray(met) && met.length > 0) {
            // Merge with champion flags
            const formatted = met.map(m => ({
              ...m,
              is_champion: m.model?.includes('gradient') || m.model?.includes('gbt'),
              status: m.model?.includes('gradient') ? 'Champion Model' : 'Challenger Model'
            }));
            setMetricsData(formatted);
          }
        }
      } catch (e) {
        // use fallback
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
        // use fallback
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
        // use fallback
      }

      // 6. Fetch Stream Metrics
      try {
        const stmRes = await fetch('/api/stream-metrics');
        if (stmRes.ok) {
          const stm = await stmRes.json();
          if (Array.isArray(stm) && stm.length > 0) {
            setStreamData(stm);
          }
        }
      } catch (e) {
        // use fallback
      }
    } catch (err) {
      console.warn("FastAPI backend not reached; running with precomputed BigData Review3 results cache.", err);
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
      case 'realtime-datasets':
        return <RealTimeDatasets summaryData={summaryData} streamData={streamData} />;
      case 'preprocessing-eda':
        return <PreprocessingEDA />;
      case 'frame-question':
        return <FrameAnalysisQuestion />;
      case 'spark-processing':
        return <SparkProcessing />;
      case 'results-visualisation':
        return <ResultsVisualization />;
      case 'conclude-decision':
        return <ConcludeDecision decisionData={decisionData} spikeData={spikeData} />;
      case 'ml-model-selection':
        return <MLModelSelection metricsData={metricsData} />;
      case 'performance-analysis':
        return <PerformanceAnalysis />;
      default:
        return <RealTimeDatasets summaryData={summaryData} streamData={streamData} />;
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
            <span className="font-bold text-slate-700">Retail Demand Lab</span> — 23CSE352 Big Data Analytics Project Review 3
          </div>
          <div className="flex items-center space-x-4">
            <span>Apache Spark 3.5.9</span>
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
