import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// ENV
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MYSQL_HOST,
  MYSQL_PORT = '3306',
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase env');
}
if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  throw new Error('Missing MySQL env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ✅ Create MySQL table
async function ensureMysqlTable(conn) {
  const sql = `
    CREATE TABLE IF NOT EXISTS crane_readings (
      id CHAR(36) NOT NULL,
      crane_id VARCHAR(64) NOT NULL,
      hoist_hours DECIMAL(18,6) NOT NULL DEFAULT 0,
      trolley_hours DECIMAL(18,6) NOT NULL DEFAULT 0,
      gantry_hours DECIMAL(18,6) NOT NULL DEFAULT 0,
      timestamp DATETIME(6) NOT NULL,
      created_at DATETIME(6) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY idx_crane_timestamp (crane_id, timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await conn.execute(sql);
}

// ✅ UTC safe format (NO timezone change)
function formatDate(dateString) {
  return new Date(dateString)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
}

// ✅ Fetch all data safely (NO SKIP)
async function fetchAll(pageSize = 1000) {
  let from = 0;
  let all = [];

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('crane_readings')
      .select('*')
      .order('id', { ascending: true }) // stable order
      .range(from, to);

    if (error) throw error;

    if (!data || data.length === 0) break;

    console.log(`📥 Fetched ${data.length} rows (${from}-${to})`);

    all.push(...data);
    from += data.length;

    if (data.length < pageSize) break;
  }

  return all;
}

// ✅ Insert batch
async function insertBatch(conn, rows) {
  const values = rows.map((row) => [
    row.id,
    row.crane_id,
    Number(row.hoist_hours ?? 0),
    Number(row.trolley_hours ?? 0),
    Number(row.gantry_hours ?? 0),
    formatDate(row.timestamp),
    formatDate(row.created_at),
  ]);

  const sql = `
    INSERT INTO crane_readings
    (id, crane_id, hoist_hours, trolley_hours, gantry_hours, timestamp, created_at)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      crane_id = VALUES(crane_id),
      hoist_hours = VALUES(hoist_hours),
      trolley_hours = VALUES(trolley_hours),
      gantry_hours = VALUES(gantry_hours),
      timestamp = VALUES(timestamp),
      created_at = VALUES(created_at);
  `;

  const [result] = await conn.query(sql, [values]);
  return result.affectedRows;
}

// 🚀 MAIN
async function migrate() {
  console.log('🚀 Starting FULL migration...');

  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    decimalNumbers: true,
  });

  await ensureMysqlTable(conn);

  const allData = await fetchAll();

  console.log(`📊 TOTAL fetched: ${allData.length}`);

  if (allData.length === 0) {
    console.log('No data found.');
    return;
  }

  const affected = await insertBatch(conn, allData);

  console.log(`✅ Inserted/Updated rows: ${affected}`);

  await conn.end();

  console.log('🎉 ALL DATA MIGRATED SUCCESSFULLY (UTC SAFE)');
}

// ❌ Error handler
migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});