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

    const [rows] = await conn.execute(
      'SELECT * FROM crane_readings ORDER BY timestamp DESC LIMIT 500'
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('DB Error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  } finally {
    if (conn) await conn.end();
  }
}
