import { useEffect, useState, useRef, useCallback } from 'react';
import { CraneLiveData, fetchLiveCraneData } from '../lib/api';
import { StatusCard } from './StatusCard';
import { RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 10000;

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

      const newHighlights = new Set<string>();
      for (const reading of data) {
        const prevHoist = prevDataRef.current.get(reading.crane_id);
        if (prevHoist !== undefined && prevHoist !== reading.hoist_hours) {
          newHighlights.add(reading.crane_id);
        }
      }

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
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadLiveData]);

  const sortedData = [...liveData].sort((a, b) =>
    a.crane_id.localeCompare(b.crane_id, undefined, { numeric: true })
  );

  const onlineCount = sortedData.filter(d => d.control_on_state).length;

  return (
    <div className="space-y-5">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-600">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{sortedData.length}</span> cranes
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm text-slate-600">
            <span className="font-medium text-emerald-600">{onlineCount}</span> online
          </span>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-400">{sortedData.length - onlineCount}</span> offline
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadLiveData}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          <span className="ml-2 text-sm text-slate-500">Loading crane data...</span>
        </div>
      ) : sortedData.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          No crane data available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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
