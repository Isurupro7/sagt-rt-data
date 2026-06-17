import { useEffect, useState } from 'react';
import { RefreshCw, LayoutGrid, Table, Activity } from 'lucide-react';
import { CraneReading, fetchCraneReadings, triggerFetchCraneData } from './lib/api';
import { CraneDataTable } from './components/CraneDataTable';
import { RealtimeStatus } from './components/RealtimeStatus';

function App() {
  const [readings, setReadings] = useState<CraneReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'table'>('status');

  const loadReadings = async () => {
    try {
      const data = await fetchCraneReadings();
      setReadings(data);
    } catch (error) {
      console.error('Error loading readings:', error);
      setMessage('Error loading readings');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewData = async () => {
    setFetching(true);
    setMessage('Fetching crane data from API...');

    try {
      const result = await triggerFetchCraneData();

      if (result.success) {
        setMessage(`Successfully fetched data for ${result.processed} cranes`);
        await loadReadings();
      } else {
        setMessage(`Error fetching data`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to fetch crane data');
    } finally {
      setFetching(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">SAGT Crane Monitor</h1>
                <p className="text-xs text-slate-400">Real-time Equipment Tracking System</p>
              </div>
            </div>
            <button
              onClick={fetchNewData}
              disabled={fetching}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-slate-200 bg-slate-700 hover:bg-slate-600 border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Alert Message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.includes('Error') || message.includes('Failed')
              ? 'bg-red-50 text-red-700 border border-red-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Live Status
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'table'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Table className="w-4 h-4" />
            Historical Data
          </button>
        </div>

        {/* Content */}
        {activeTab === 'status' ? (
          <RealtimeStatus />
        ) : (
          <CraneDataTable readings={readings} loading={loading} />
        )}
      </div>
    </div>
  );
}

export default App;
