import { useEffect, useState } from 'react';
import { RefreshCw, Database } from 'lucide-react';
import { supabase, CraneReading } from './lib/supabase';
import { CraneDataTable } from './components/CraneDataTable';

function App() {
  const [readings, setReadings] = useState<CraneReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState('');

  const loadReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('crane_readings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setReadings(data || []);
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
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-crane-data`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers
      });
      const result = await response.json();

      if (result.success) {
        setMessage(`Successfully fetched data for ${result.processed} cranes!`);
        await loadReadings();
      } else {
        setMessage(`Error: ${result.error}`);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Crane Data Monitor</h1>
            </div>
            <button
              onClick={fetchNewData}
              disabled={fetching}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${fetching ? 'animate-spin' : ''}`} />
              {fetching ? 'Fetching...' : 'Fetch Latest Data'}
            </button>
          </div>
          {message && (
            <div className={`mt-4 px-4 py-3 rounded-lg ${
              message.includes('Error') || message.includes('Failed')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        <CraneDataTable readings={readings} loading={loading} />
      </div>
    </div>
  );
}

export default App;
