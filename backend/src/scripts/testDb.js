const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT),
  connectionTimeoutMillis: 5000,
});

async function test() {
  console.log(`Connecting to ${process.env.PGHOST}:${process.env.PGPORT} as ${process.env.PGUSER}...`);
  try {
    const client = await pool.connect();
    console.log('CONNECTED successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('CONNECTION FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

test();
