require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const path = require('path');
const { query, getPool } = require('./db');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await query(sql);
  console.log('migrate ok');
  await getPool().end();
})().catch(e => { console.error('migrate failed:', e.message); process.exit(1); });
