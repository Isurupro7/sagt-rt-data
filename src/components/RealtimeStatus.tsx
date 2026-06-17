import { useEffect, useState, useRef, useCallback } from 'react';
import { CraneLiveData, fetchLiveCraneData } from '../lib/api';
import { StatusCard } from './StatusCard';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 10000; // 10 seconds

export function RealtimeStatus() {
  const [liveData, setLiveData] = useState<CraneLiveData[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDataRef = useRef<Map<string, number>>(new Map());

  const loadLiveData = useCallback(async () => {
    try {
      const data = await fetchLiveCraneData();
      setConnected(true);
      setLoading(false);

      // Detect which cranes got new data (hoist hours changed)
      const newHighlights = new Set<string>();
      for (const reading of data) {
        const prevHoist = prevDataRef.current.get(reading.crane_id);
        if (prevHoist !== undefined && prevHoist !== reading.hoist_hours) {
          newHighlights.add(reading.crane_id);
        }
      }

      // Update prev data
      const newPrev = new Map<string, number>();
      for (const reading of data) {
        newPrev.set(reading.crane_id, reading.hoist_hours);
      }
      prevDataRef.current = newPrev;

      setLiveData(data);
      setLastUpdate(new Date());

      if (newHighlights.size > 0) {
        setNewIds(newHighlights);
        setTimeout(() => setNewIds(new Set()), 3000);
      }
    } catch (error) {
      console.error('Error loading live data:', error);
      setConnected(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();

    intervalRef.current = setInterval(loadLiveData, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadLiveData]);

  const sortedData = [...liveData].sort((a, b) =>
    a.crane_id.localeCompare(b.crane_id, undefined, { numeric: true })
  );

  const onlineCount = sortedData.filter(d => d.control_on_state).length;

  return (
    <div className="space-y-6">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-md px-5 py-3">
        <div className="flex items-center space-x-3">
          {connected ? (
            <span className="flex items-center text-green-600">
              <Wifi className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Connected</span>
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="ml-2 text-xs text-gray-400">polling every 10s</span>
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <WifiOff className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Disconnected</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadLiveData}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Monitoring <span className="font-semibold text-blue-600">{sortedData.length}</span> cranes
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          <span className="font-semibold text-green-600">{onlineCount}</span> online
        </span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          <span className="font-semibold text-gray-500">{sortedData.length - onlineCount}</span> offline
        </span>
      </div>

      {/* Status Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading crane data...</p>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No crane data available. Check API connection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedData.map((reading) => (
            <StatusCard
              key={reading.crane_id}
              reading={reading}
              isNew={newIds.has(reading.crane_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
