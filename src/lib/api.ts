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

const HOIST_IDS = [
  '02','03','04','05','06','07','08','09','10','11',
  '13','15','17','18','20','22','23','24','25','26',
  '27','28','29','30','31','32','33','34','35','36','37'
];

const RT_IDS_REFURBISHED = [
  '02','04','08','09','13','15','17','23','29','30','31','32','33','34','35','36','37'
];

const CRANE_API_BASE = 'https://sagt-data.rwitter.cloud/get_hoist_hours_';

export async function fetchLiveCraneData(): Promise<CraneLiveData[]> {
  const results: CraneLiveData[] = [];

  const promises = HOIST_IDS.map(async (id) => {
    try {
      const res = await fetch(CRANE_API_BASE + id);
      const data = await res.json();
      const divisor = RT_IDS_REFURBISHED.includes(id) ? 60 : 1;

      return {
        crane_id: `RT ${id}`,
        hoist_hours: data.hoist_hours / divisor,
        trolley_hours: data.trolley_hours / divisor,
        gantry_hours: data.gantry_hours / divisor,
        control_on_state: data.control_on_state ?? false,
        soc1: data.soc1 ?? 0,
        soc2: data.soc2 ?? 0,
        soc3: data.soc3 ?? 0,
        engine_auto_mode: data.engine_auto_mode ?? false,
      } as CraneLiveData;
    } catch {
      return null;
    }
  });

  const fetched = await Promise.all(promises);
  fetched.forEach((item) => {
    if (item) results.push(item);
  });

  return results;
}
