import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import path from 'node:path';
import fs from 'node:fs';
import { app } from 'electron';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let dbPath: string = '';

async function initSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  // Locate wasm: in asar-packaged app it lives next to the compiled JS in dist-electron;
  // in dev it is in node_modules/sql.js/dist/
  const candidates = [
    path.join(__dirname, 'sql-wasm.wasm'),
    path.join(process.resourcesPath || '', 'sql-wasm.wasm'),
    path.join(app.getAppPath(), 'dist-electron', 'sql-wasm.wasm'),
    path.resolve(__dirname, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
  ];
  let wasmBinary: Buffer | undefined;
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        wasmBinary = fs.readFileSync(p);
        break;
      }
    } catch { /* ignore */ }
  }
  SQL = await initSqlJs(wasmBinary ? ({ wasmBinary: new Uint8Array(wasmBinary) } as any) : undefined);
  return SQL;
}

export async function getDb(): Promise<Database> {
  if (db) return db;
  const sql = await initSql();
  const userData = app.getPath('userData');
  if (!fs.existsSync(userData)) fs.mkdirSync(userData, { recursive: true });
  dbPath = path.join(userData, 'codepharm.db');

  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    db = new sql.Database(buf);
  } else {
    db = new sql.Database();
  }
  migrate(db);
  persist();
  return db;
}

function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Wrap DB writes with auto-persist
export function runPersist(fn: () => void) {
  fn();
  persist();
}

function nowIsoLocal(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset();
  // We store ISO UTC string; display converts to Jalali at render time.
  return d.toISOString();
}
export { nowIsoLocal };

function migrate(d: Database) {
  d.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT ''
    );
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_code INTEGER UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  d.run(`CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);`);
  d.run(`CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);`);
  d.run(`CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(subscription_code);`);

  const defaults: Record<string, string> = {
    pharmacy_name: 'داروخانه',
    paper_size: 'A5',
    sidebar_collapsed: 'false',
    next_subscription_code: '101',
  };
  const ins = d.prepare('INSERT OR IGNORE INTO settings(key, value) VALUES (?, ?)');
  for (const [k, v] of Object.entries(defaults)) ins.run([k, v]);
  ins.free();
}

export function getDbPath(): string {
  return dbPath;
}

// Call before app quits; fs-safe
export function closeDb() {
  if (db) {
    try { persist(); } catch { /* ignore */ }
    db.close();
    db = null;
  }
}

// Persist helper exported for IPC
export { persist as persistDb };
