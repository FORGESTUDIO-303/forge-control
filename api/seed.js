require('dotenv').config();
const { query, getPool } = require('./db');
(async () => {
  const c = await query('select count(*)::int as c from devices');
  if (c.rows[0].c === 0) {
    await query(`insert into devices (name, detail, is_on) values
      ('Mainboard','ATX - BIOS 1204',true),
      ('GeForce GT 720M','2GB - 1080p30 target',true),
      ('Intel HD Graphics','iGPU - power saving',true),
      ('Keyboard','per-key - Forge Glow',true),
      ('Mouse','16000 DPI - 1000Hz',false),
      ('Headset','7.1 - mic monitoring',true)`);
  }
  const r = await query('select count(*)::int as c from devices');
  console.log('seeded devices:' + r.rows[0].c);
  await getPool().end();
})().catch(e => { console.error(e.message); process.exit(1); });
