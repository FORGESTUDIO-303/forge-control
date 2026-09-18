const { Pool } = require('pg');

let pool = null;
function getPool() {
  if (pool) return pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error('DATABASE_URL missing - copy .env.example to .env');
  pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, max: 3 });
  return pool;
}
async function query(text, params) {
  return getPool().query(text, params);
}
module.exports = { getPool, query };
