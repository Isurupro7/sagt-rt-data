import { useEffect, useState, useRef } from 'react';
import { supabase, CraneReading } from '../lib/supabase';
import { StatusCard } from './StatusCard';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function RealtimeStatus() {
  const [latestReadings, setLatestReadings] = useState<Map<string, CraneReading>>(new Map());
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load latest readings per crane
  const loadLatestReadings = async () => {
    const { data, error } = await supabase
      .from('crane_readings')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading readings:', error);
      return;
    }

    if (data) {
      const map = new Map<string, CraneReading>();
      for (const reading of data) {
        if (!map.has(reading.crane_id)) {
          map.set(reading.crane_id, reading);
        }
      }
      setLatestReadings(map);
      if (data.length > 0) {
        setLastUpdate(new Date(data[0].timestamp));
      }
    }
  };

  // Subscribe to realtime changes
  useEffect(() => {
    loadLatestReadings();

    const channel = supabase
      .channel('crane-readings-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crane_readings',
        },
        (payload) => {
          const newReading = payload.new as CraneReading;
          setLatestReadings((prev) => {
            const updated = new Map(prev);
            updated.set(newReading.crane_id, newReading);
            return updated;
          });
          setLastUpdate(new Date(newReading.timestamp));

          // Highlight new update
          setNewIds((prev) => new Set(prev).add(newReading.crane_id));
          setTimeout(() => {
            setNewIds((prev) => {
              const updated = new Set(prev);
              updated.delete(newReading.crane_id);
              return updated;
            });
          }, 3000);
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const sortedReadings = Array.from(latestReadings.values()).sort((a, b) =>
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
              <span className="text-sm font-medium">Real-time Connected</span>
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
            title="Refresh"
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
