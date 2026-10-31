// Direct smoke test using the Electron db.js module logic in-process (re-implemented)
const fs = require('fs');
fs.rmSync('/tmp/cp-smoke', { recursive: true, force: true });
fs.mkdirSync('/tmp/cp-smoke', { recursive: true });
const sql = require('sql.js');
const crypto = require('crypto');
(async () => {
  const SQL = await sql({ wasmBinary: new Uint8Array(fs.readFileSync('./node_modules/sql.js/dist/sql-wasm.wasm')) });
  let db = new SQL.Database();
  db.run('CREATE TABLE users(id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL)');
  db.run('CREATE TABLE patients(id INTEGER PRIMARY KEY, subscription_code INTEGER UNIQUE NOT NULL, full_name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT "", address TEXT NOT NULL DEFAULT "", created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');
  db.run('CREATE TABLE settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const defaults = { pharmacy_name:'داروخانه', paper_size:'A5', sidebar_collapsed:'false', next_subscription_code:'101' };
  for (const [k,v] of Object.entries(defaults)) {
    const s = db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES (?,?)'); s.run([k,v]); s.free();
  }
  // Create admin
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update('pass123').digest('hex');
  const s = db.prepare('INSERT INTO users(id,username,password_hash,salt,created_at) VALUES (?,?,?,?,?)');
  s.run([1, 'admin', hash, salt, new Date().toISOString()]); s.free();
  // Create a patient
  const now = new Date().toISOString();
  const code = 101;
  const ps = db.prepare('INSERT INTO patients(id,subscription_code,full_name,phone,address,created_at,updated_at) VALUES (?,?,?,?,?,?,?)');
  ps.run([1, code, 'مهدی حنیفه', '09123456789', 'تهران', now, now]); ps.free();
  // Search by code
  let res = db.exec('SELECT subscription_code, full_name FROM patients WHERE subscription_code=?', [101]);
  console.log('by code:', res[0].values);
  // Search by name (we do in-JS normalization)
  res = db.exec('SELECT * FROM patients');
  console.log('all cols:', res[0].columns);
  console.log('all values count:', res[0].values.length);
  db.close();
  console.log('SMOKE OK');
})().catch(e => { console.error(e); process.exit(1); });
