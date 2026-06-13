import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const getConnection = () =>
  mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    decimalNumbers: true,
  });

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timestamp = new Date();
  const results = [];
  const errors = [];

  try {
    // Fetch data from all cranes
    const fetchPromises = HOIST_IDS.map(async (id) => {
      try {
        const response = await fetch(BASE_URL + id);
        const data = await response.json();

        const divisor = RT_IDS_REFURBISHED.includes(id) ? 60 : 1;

        return {
          id: randomUUID(),
          crane_id: `RT ${id}`,
          hoist_hours: data.hoist_hours / divisor,
          trolley_hours: data.trolley_hours / divisor,
          gantry_hours: data.gantry_hours / divisor,
          timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' '),
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
      } catch (e) {
        errors.push({ crane: `RT ${id}`, error: String(e) });
        return null;
      }
    });

    const fetchedData = await Promise.all(fetchPromises);
    const validData = fetchedData.filter((item) => item !== null);

    if (validData.length > 0) {
      const conn = await getConnection();

      try {
        const values = validData.map((row) => [
          row.id,
          row.crane_id,
          row.hoist_hours,
          row.trolley_hours,
          row.gantry_hours,
          row.timestamp,
          row.created_at,
        ]);

        const sql = `
          INSERT INTO crane_readings
          (id, crane_id, hoist_hours, trolley_hours, gantry_hours, timestamp, created_at)
          VALUES ?
          ON DUPLICATE KEY UPDATE
            hoist_hours = VALUES(hoist_hours),
            trolley_hours = VALUES(trolley_hours),
            gantry_hours = VALUES(gantry_hours),
            created_at = VALUES(created_at)
        `;

        await conn.query(sql, [values]);
        validData.forEach((item) => {
          results.push({ crane: item.crane_id, success: true });
        });
      } finally {
        await conn.end();
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: timestamp.toISOString(),
      processed: results.length,
      errorsCount: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
