const { Pool } = require('pg');
const pool = new Pool({
  host: '10.203.14.50',
  user: 'postgres',
  password: 'usg12345',
  database: 'docsforge',
  port: 5432,
});

async function main() {
  console.log('Testing connection with hardcoded credentials...');
  try {
    const res = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = $1', ['public']);
    console.log('Tables:', res.rows.map(r => r.tablename));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
