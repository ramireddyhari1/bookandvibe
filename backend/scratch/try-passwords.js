const { Pool } = require('pg');

async function tryPassword(password) {
  const connectionString = `postgresql://postgres:${password}@127.0.0.1:5432/book_and_vibe`;
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 2000 });
  try {
    const client = await pool.connect();
    console.log(`Success with password: "${password}"`);
    client.release();
    return true;
  } catch (error) {
    console.log(`Failed with password: "${password}" - ${error.message}`);
    return false;
  } finally {
    await pool.end();
  }
}

async function run() {
  const passwords = ['postgres', 'admin', 'root', '', 'password', 'password123'];
  for (const pw of passwords) {
    if (await tryPassword(pw)) break;
  }
}

run();
