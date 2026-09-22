const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'cench',
  database: process.env.PGDATABASE || 'docsforge',
  port: process.env.PGPORT || 5432,
  max: 10,
});

const db = {
  query: async (text, params = []) => {
    try {
      let pgText = text;
      let i = 1;
      while (pgText.includes('?')) {
        pgText = pgText.replace('?', `$${i}`);
        i++;
      }
      
      const res = await pool.query(pgText, params);
      return [res.rows, res.fields];
    } catch (err) {
      console.error(`DB_ERROR: ${err.message}`, { query: text, params });
      throw err;
    }
  },
  
  logActivity: async (type, message, bankId = null, userName = 'System Admin') => {
    try {
      console.log(`LOG_ACTIVITY: ${type} - ${message}`);
      await pool.query(
        'INSERT INTO activities (type, message, "bankId", user_name) VALUES ($1, $2, $3, $4)',
        [type, message, bankId, userName]
      );
    } catch (err) {
      console.error('FAILED_TO_LOG_ACTIVITY:', err.message);
    }
  }
};

module.exports = db;
