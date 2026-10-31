import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { getDb, getDbPath, closeDb, persistDb } from './db';
import { hashPassword, verifyPassword } from './crypto';
import { printPatientSlip } from './print';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: '#F5F8FA',
    title: 'کد ای فارم',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

// Run SELECT that returns a single value
function scalar<T = any>(db: any, sql: string, params: any[] = []): T | null {
  const res = db.exec(sql, params);
  if (!res.length || !res[0].values.length) return null;
  return res[0].values[0][0] as T;
}

// Run SELECT that returns a single row as object
function one<T = any>(db: any, sql: string, params: any[] = []): T | null {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let row: T | null = null;
  if (stmt.step()) {
    row = stmt.getAsObject() as T;
  }
  stmt.free();
  return row;
}

function execRun(db: any, sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
}

function all<T = any>(db: any, sql: string, params: any[] = []): T[] {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  const cols: string[] = res[0].columns;
  return res[0].values.map((r: any[]) => {
    const o: any = {};
    cols.forEach((c, i) => (o[c] = r[i]));
    return o as T;
  });
}

function registerIpc() {
  // --- Auth ---
  ipcMain.handle('auth:hasAnyUser', async () => {
    const db = await getDb();
    const c = scalar<number>(db, 'SELECT COUNT(*) as c FROM users');
    return (c ?? 0) > 0;
  });

  ipcMain.handle('auth:createAdmin', async (_e, { username, password }: { username: string; password: string }) => {
    const db = await getDb();
    const { salt, hash } = hashPassword(password);
    try {
      const now = nowIso();
      const id = (scalar<number>(db, 'SELECT COALESCE(MAX(id),0)+1 AS n FROM users') ?? 1);
      execRun(db, 'INSERT INTO users(id, username, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, username.trim(), hash, salt, now]);
      persistDb();
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('auth:login', async (_e, { username, password }: { username: string; password: string }) => {
    const db = await getDb();
    const row = one<{ id: number; username: string; password_hash: string; salt: string }>(
      db, 'SELECT id, username, password_hash, salt FROM users WHERE username = ?', [username.trim()]
    );
    if (!row) return { ok: false, error: 'invalid' };
    if (!verifyPassword(password, row.salt, row.password_hash)) return { ok: false, error: 'invalid' };
    return { ok: true, user: { id: row.id, username: row.username } };
  });

  // --- Patients ---
  ipcMain.handle('patients:create', async (_e, { full_name, phone, address }: { full_name: string; phone: string; address: string }) => {
    const db = await getDb();
    const code = parseInt(String(scalar(db, "SELECT value FROM settings WHERE key='next_subscription_code'") ?? '101'), 10);
    try {
      const now = nowIso();
      const id = (scalar<number>(db, 'SELECT COALESCE(MAX(id),0)+1 AS n FROM patients') ?? 1);
      execRun(db,
        'INSERT INTO patients(id, subscription_code, full_name, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, code, full_name.trim(), phone.trim(), address.trim(), now, now]
      );
      execRun(db, "UPDATE settings SET value = ? WHERE key = 'next_subscription_code'", [String(code + 1)]);
      persistDb();
      const patient = one(db, 'SELECT * FROM patients WHERE id = ?', [id]);
      return { ok: true, patient };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('patients:update', async (_e, { id, full_name, phone, address }: { id: number; full_name: string; phone: string; address: string }) => {
    const db = await getDb();
    try {
      const now = nowIso();
      execRun(db,
        'UPDATE patients SET full_name=?, phone=?, address=?, updated_at=? WHERE id=?',
        [full_name.trim(), phone.trim(), address.trim(), now, id]
      );
      persistDb();
      const patient = one(db, 'SELECT * FROM patients WHERE id=?', [id]);
      return { ok: true, patient };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('patients:get', async (_e, id: number) => {
    const db = await getDb();
    return one(db, 'SELECT * FROM patients WHERE id=?', [id]);
  });

  ipcMain.handle('patients:phoneExists', async (_e, { phone, excludeId }: { phone: string; excludeId?: number }) => {
    const db = await getDb();
    if (excludeId !== undefined) {
      const c = scalar<number>(db, 'SELECT COUNT(*) as c FROM patients WHERE phone=? AND id<>?', [phone, excludeId]);
      return (c ?? 0) > 0;
    }
    const c = scalar<number>(db, 'SELECT COUNT(*) as c FROM patients WHERE phone=?', [phone]);
    return (c ?? 0) > 0;
  });

  function normalizeStr(s: string): string {
    return s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function allPatients(db: any): any[] {
    return all(db, 'SELECT * FROM patients ORDER BY subscription_code DESC');
  }

  ipcMain.handle('patients:search', async (_e, query: string) => {
    const db = await getDb();
    const q = (query || '').trim();
    if (!q) return [];
    const digitsOnly = q.replace(/\D/g, '');
    if (/^\d+$/.test(digitsOnly)) {
      const code = parseInt(digitsOnly, 10);
      const row = one(db, 'SELECT * FROM patients WHERE subscription_code=?', [code]);
      if (row) return [row];
    }
    const patients = allPatients(db);
    const nq = normalizeStr(q);
    return patients.filter(p => normalizeStr(String(p.full_name ?? '')).includes(nq) || String(p.phone ?? '').includes(digitsOnly));
  });

  ipcMain.handle('patients:list', async (_e, { page, perPage, query }: { page: number; perPage: number; query: string }) => {
    const db = await getDb();
    const q = (query || '').trim();
    const offset = (page - 1) * perPage;
    if (!q) {
      const total = scalar<number>(db, 'SELECT COUNT(*) as c FROM patients') ?? 0;
      const rows = all(db, 'SELECT * FROM patients ORDER BY subscription_code DESC LIMIT ? OFFSET ?', [perPage, offset]);
      return { rows, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
    }
    const patients = allPatients(db);
    const nq = normalizeStr(q);
    const digitsOnly = q.replace(/\D/g, '');
    const filtered = patients.filter(p =>
      normalizeStr(String(p.full_name ?? '')).includes(nq) ||
      String(p.phone ?? '').includes(q) ||
      String(p.subscription_code ?? '').includes(digitsOnly)
    );
    const total = filtered.length;
    const rows = filtered.slice(offset, offset + perPage);
    return { rows, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  });

  // --- Settings ---
  ipcMain.handle('settings:get', async () => {
    const db = await getDb();
    const rows = all<{ key: string; value: string }>(db, 'SELECT key, value FROM settings');
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    return {
      pharmacy_name: obj.pharmacy_name || 'داروخانه',
      paper_size: (obj.paper_size as any) || 'A5',
      sidebar_collapsed: obj.sidebar_collapsed === 'true',
    };
  });

  ipcMain.handle('settings:set', async (_e, { key, value }: { key: string; value: string }) => {
    const db = await getDb();
    const exists = !!one(db, 'SELECT 1 FROM settings WHERE key=?', [key]);
    if (exists) {
      execRun(db, 'UPDATE settings SET value=? WHERE key=?', [value, key]);
    } else {
      execRun(db, 'INSERT INTO settings(key, value) VALUES (?, ?)', [key, value]);
    }
    persistDb();
    return { ok: true };
  });

  // --- Backup / Restore ---
  ipcMain.handle('db:backup', async () => {
    persistDb();
    const src = getDbPath();
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: 'ذخیره فایل پشتیبان',
      defaultPath: `codepharm-backup-${new Date().toISOString().slice(0,10)}.db`,
      filters: [{ name: 'Database', extensions: ['db'] }],
    });
    if (canceled || !filePath) return { ok: false, error: 'canceled' };
    try {
      fs.copyFileSync(src, filePath);
      return { ok: true, path: filePath };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('db:restore', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
      title: 'انتخاب فایل پشتیبان',
      properties: ['openFile'],
      filters: [{ name: 'Database', extensions: ['db'] }],
    });
    if (canceled || !filePaths?.[0]) return { ok: false, error: 'canceled' };
    try {
      closeDb();
      const dest = getDbPath() || path.join(app.getPath('userData'), 'codepharm.db');
      fs.copyFileSync(filePaths[0], dest);
      await getDb();
      return { ok: true };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });

  // --- Print ---
  ipcMain.handle('print:patient', async (_e, data) => {
    try {
      const ok = await printPatientSlip(mainWindow, data);
      return { ok };
    } catch (err: unknown) {
      return { ok: false, error: (err as Error).message };
    }
  });
}

app.whenReady().then(async () => {
  await getDb();
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  try {
    persistDb();
    const userData = app.getPath('userData');
    const backupDir = path.join(userData, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const src = getDbPath();
    if (src && fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(backupDir, `codepharm-${stamp}.db`));
      const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('codepharm-') && f.endsWith('.db'))
        .sort()
        .reverse();
      for (const f of files.slice(5)) fs.unlinkSync(path.join(backupDir, f));
    }
  } catch {
    /* ignore */
  }
  closeDb();

  if (process.platform !== 'darwin') app.quit();
});
