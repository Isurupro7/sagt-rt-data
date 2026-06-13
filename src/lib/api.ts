export interface CraneReading {
  id: string;
  crane_id: string;
  hoist_hours: number;
  trolley_hours: number;
  gantry_hours: number;
  timestamp: string;
  created_at: string;
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
