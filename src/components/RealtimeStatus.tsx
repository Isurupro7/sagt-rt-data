import { useEffect, useState, useRef, useCallback } from 'react';
import { CraneLiveData, fetchLiveCraneData } from '../lib/api';
import { StatusCard } from './StatusCard';
import { RefreshCw } from 'lucide-react';

const POLL_INTERVAL = 10000;

const CRANE_IDS = [
  'RT 02','RT 03','RT 04','RT 05','RT 06','RT 07','RT 08','RT 09','RT 10','RT 11',
  'RT 13','RT 15','RT 17','RT 18','RT 20','RT 22','RT 23','RT 24','RT 25','RT 26',
  'RT 27','RT 28','RT 29','RT 30','RT 31','RT 32','RT 33','RT 34','RT 35','RT 36','RT 37'
];

const EMPTY_READING: Omit<CraneLiveData, 'crane_id'> = {
  hoist_hours: 0,
  trolley_hours: 0,
  gantry_hours: 0,
  control_on_state: false,
  soc1: 0,
  soc2: 0,
  soc3: 0,
  engine_auto_mode: false,
};

export function RealtimeStatus() {
  const [liveData, setLiveData] = useState<Map<string, CraneLiveData>>(new Map());
  const [connected, setConnected] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDataRef = useRef<Map<string, number>>(new Map());

  const loadLiveData = useCallback(async () => {
    try {
      const data = await fetchLiveCraneData();
      setConnected(true);
      setDataLoaded(true);

      const newHighlights = new Set<string>();
      for (const reading of data) {
        const prevHoist = prevDataRef.current.get(reading.crane_id);
        if (prevHoist !== undefined && prevHoist !== reading.hoist_hours) {
          newHighlights.add(reading.crane_id);
        }
      }

      const newPrev = new Map<string, number>();
      const newMap = new Map<string, CraneLiveData>();
      for (const reading of data) {
        newPrev.set(reading.crane_id, reading.hoist_hours);
        newMap.set(reading.crane_id, reading);
      }
      prevDataRef.current = newPrev;

      setLiveData(newMap);
      setLastUpdate(new Date());

      if (newHighlights.size > 0) {
        setNewIds(newHighlights);
        setTimeout(() => setNewIds(new Set()), 3000);
      }
    } catch (error) {
      console.error('Error loading live data:', error);
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();
    intervalRef.current = setInterval(loadLiveData, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadLiveData]);

  const onlineCount = Array.from(liveData.values()).filter(d => d.control_on_state).length;

  return (
    <div className="space-y-5">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-600">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{CRANE_IDS.length}</span> cranes
          </span>
          {dataLoaded && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-sm text-slate-600">
                <span className="font-medium text-emerald-600">{onlineCount}</span> online
              </span>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-sm text-slate-600">
                <span className="font-medium text-slate-400">{CRANE_IDS.length - onlineCount}</span> offline
              </span>
            </>
          )}
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
            <RefreshCw className={`w-3.5 h-3.5 ${!dataLoaded ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid - always show cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {CRANE_IDS.map((craneId) => {
          const reading = liveData.get(craneId) || { crane_id: craneId, ...EMPTY_READING };
          return (
            <StatusCard
              key={craneId}
              reading={reading}
              isNew={newIds.has(craneId)}
              isLoading={!dataLoaded}
            />
          );
        })}
      </div>
    </div>
  );
}
