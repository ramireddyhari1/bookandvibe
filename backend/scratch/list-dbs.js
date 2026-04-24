const { Pool } = require('pg');

async function listDatabases() {
  const connectionString = `postgresql://postgres:postgres@127.0.0.1:5432/postgres`;
  const pool = new Pool({ connectionString });
  try {
    const res = await pool.query('SELECT datname FROM pg_database');
    console.log('Databases:', res.rows.map(r => r.datname));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

listDatabases();
