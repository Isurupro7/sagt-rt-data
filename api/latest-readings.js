import mysql from 'mysql2/promise';

const getConnection = () =>
  mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    decimalNumbers: true,
  });

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

  let conn;
  try {
    conn = await getConnection();

    // Get the latest reading per crane
    const [rows] = await conn.execute(`
      SELECT cr.*
      FROM crane_readings cr
      INNER JOIN (
        SELECT crane_id, MAX(timestamp) as max_ts
        FROM crane_readings
        GROUP BY crane_id
      ) latest ON cr.crane_id = latest.crane_id AND cr.timestamp = latest.max_ts
      ORDER BY cr.crane_id
    `);

    // Get last update timestamp
    const [lastRow] = await conn.execute(
      'SELECT MAX(timestamp) as last_update FROM crane_readings'
    );

    return res.status(200).json({
      success: true,
      data: rows,
      lastUpdate: lastRow[0]?.last_update || null,
    });
  } catch (error) {
    console.error('DB Error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  } finally {
    if (conn) await conn.end();
  }
}
