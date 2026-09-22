const { Pool, Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
  const dbName = process.env.PGDATABASE || 'docsforge';

  // 1. Connect to default to create the DB
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'cench',
    port: process.env.PGPORT || 5432,
    database: 'postgres'
  });

  await client.connect();
  try {
    const res = await client.query(`SELECT datname FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Creating database ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
    }
  } catch (err) { console.error(err); }
  finally { await client.end(); }

  // 2. Connect to the new DB for Table creation
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'cench',
    port: process.env.PGPORT || 5432,
    database: dbName
  });

  try {
    // Shared Auto-Update Timestamp Function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN NEW."updatedAt" = CURRENT_TIMESTAMP; RETURN NEW; END;
      $$ language 'plpgsql';
    `);

    console.log('Creating portals table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portals (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        "bankCode" VARCHAR(50) DEFAULT NULL,
        "logoUrl" TEXT DEFAULT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`DROP TRIGGER IF EXISTS trg_portals_update ON portals;`);
    await pool.query(`CREATE TRIGGER trg_portals_update BEFORE UPDATE ON portals FOR EACH ROW EXECUTE FUNCTION update_timestamp();`);

    console.log('Creating documents table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(100) PRIMARY KEY,
        "bankId" VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT NULL,
        "activityCode" VARCHAR(100) DEFAULT NULL,
        "parentId" VARCHAR(100) DEFAULT NULL,
        content TEXT,
        author VARCHAR(100) DEFAULT NULL,
        "isVersion" BOOLEAN DEFAULT FALSE,
        "versionLabel" VARCHAR(50) DEFAULT NULL,
        position INT DEFAULT 1,
        visibility VARCHAR(20) DEFAULT 'specific',
        "assignedBanks" TEXT DEFAULT NULL,
        "isPublished" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_portals FOREIGN KEY ("bankId") REFERENCES portals(id) ON DELETE CASCADE,
        CONSTRAINT fk_documents FOREIGN KEY ("parentId") REFERENCES documents(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`DROP TRIGGER IF EXISTS trg_docs_update ON documents;`);
    await pool.query(`CREATE TRIGGER trg_docs_update BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_timestamp();`);

    console.log('Creating activities table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        user_name VARCHAR(100) DEFAULT 'System Admin',
        "bankId" VARCHAR(100) DEFAULT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating templates table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(100) DEFAULT 'General',
        content TEXT,
        sections JSONB DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`DROP TRIGGER IF EXISTS trg_templates_update ON templates;`);
    await pool.query(`CREATE TRIGGER trg_templates_update BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_timestamp();`);

    console.log('Creating media table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        mimetype VARCHAR(100),
        size BIGINT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL Database Initialized Successfully!');
  } catch (err) { console.error(err); process.exit(1); }
  finally { await pool.end(); }
}

initDb();
