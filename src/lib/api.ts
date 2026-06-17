export interface CraneReading {
  id: string;
  crane_id: string;
  hoist_hours: number;
  trolley_hours: number;
  gantry_hours: number;
  timestamp: string;
  created_at: string;
}

export interface CraneLiveData {
  crane_id: string;
  hoist_hours: number;
  trolley_hours: number;
  gantry_hours: number;
  control_on_state: boolean;
  soc1: number;
  soc2: number;
  soc3: number;
  engine_auto_mode: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchCraneReadings(): Promise<CraneReading[]> {
  const res = await fetch(`${API_BASE}/api/crane-readings`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch readings');
  return json.data;
}

export async function fetchLatestReadings(): Promise<{
  data: CraneReading[];
  lastUpdate: string | null;
}> {
  const res = await fetch(`${API_BASE}/api/latest-readings`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch latest readings');
  return { data: json.data, lastUpdate: json.lastUpdate };
}

export async function triggerFetchCraneData(): Promise<{
  success: boolean;
  processed: number;
  errorsCount: number;
  errors: Array<{ crane: string; error: string }>;
}> {
  const res = await fetch(`${API_BASE}/api/fetch-crane-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function fetchLiveCraneData(): Promise<CraneLiveData[]> {
  const res = await fetch(`${API_BASE}/api/live-crane-data`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch live data');
  return json.data;
}

export function streamLiveCraneData(
  onCrane: (data: CraneLiveData) => void,
  onDone: () => void,
  onError: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/live-crane-data?stream=1`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as CraneLiveData;
      onCrane(data);
    } catch {
      // skip parse errors
    }
  };

  eventSource.addEventListener('done', () => {
    eventSource.close();
    onDone();
  });

  eventSource.onerror = () => {
    eventSource.close();
    onError(new Error('Stream connection failed'));
  };

  // Return cleanup function
  return () => eventSource.close();
}
