import { useEffect, useState, useRef, useCallback } from 'react';
import { CraneReading, fetchLatestReadings } from '../lib/api';
import { StatusCard } from './StatusCard';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 10000; // 10 seconds

export function RealtimeStatus() {
  const [latestReadings, setLatestReadings] = useState<CraneReading[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevReadingsRef = useRef<Map<string, string>>(new Map());

  const loadLatestReadings = useCallback(async () => {
    try {
      const { data, lastUpdate: lu } = await fetchLatestReadings();
      setConnected(true);

      // Detect which cranes got new data
      const newHighlights = new Set<string>();
      for (const reading of data) {
        const prevTimestamp = prevReadingsRef.current.get(reading.crane_id);
        if (prevTimestamp && prevTimestamp !== reading.timestamp) {
          newHighlights.add(reading.crane_id);
        }
      }

      // Update prev timestamps
      const newPrev = new Map<string, string>();
      for (const reading of data) {
        newPrev.set(reading.crane_id, reading.timestamp);
      }
      prevReadingsRef.current = newPrev;

      setLatestReadings(data);

      if (lu) {
        setLastUpdate(new Date(lu));
      }

      if (newHighlights.size > 0) {
        setNewIds(newHighlights);
        setTimeout(() => setNewIds(new Set()), 3000);
      }
    } catch (error) {
      console.error('Error loading readings:', error);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    loadLatestReadings();

    intervalRef.current = setInterval(loadLatestReadings, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadLatestReadings]);

  const sortedReadings = latestReadings.sort((a, b) =>
    a.crane_id.localeCompare(b.crane_id, undefined, { numeric: true })
  );

  return (
    <div className="space-y-6">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3">
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
              Last update: {lastUpdate.toLocaleString()}
            </span>
          )}
          <button
            onClick={loadLatestReadings}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crane Count */}
      <div className="text-sm text-gray-600">
        Monitoring <span className="font-semibold text-blue-600">{sortedReadings.length}</span> cranes
      </div>

      {/* Status Grid */}
      {sortedReadings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No crane data available yet. Fetch data to begin monitoring.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedReadings.map((reading) => (
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
