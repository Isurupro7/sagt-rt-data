const HOIST_IDS = [
  '02','03','04','05','06','07','08','09','10','11',
  '13','15','17','18','20','22','23','24','25','26',
  '27','28','29','30','31','32','33','34','35','36','37'
];

const RT_IDS_REFURBISHED = [
  '02','04','08','09','13','15','17','23','29','30','31','32','33','34','35','36','37'
];

const BASE_URL = 'https://sagt-data.rwitter.cloud/get_hoist_hours_';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const fetchPromises = HOIST_IDS.map(async (id) => {
      try {
        const response = await fetch(BASE_URL + id, {
          signal: controller.signal,
        });
        const data = await response.json();
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
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    clearTimeout(timeout);
    const validData = results.filter((item) => item !== null);

    return res.status(200).json({ success: true, data: validData });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
