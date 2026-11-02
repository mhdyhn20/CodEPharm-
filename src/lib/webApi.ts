// Web (browser) implementation of the API exposed by electron/preload.ts.
// Uses localStorage + a JSON store so the app can run as a preview on GitHub Pages.

import type { Api } from '../../electron/preload';

const DB_KEY = 'codepharm_db_v1';
const SETTINGS_KEY = 'codepharm_settings_v1';

interface PatientRec {
  id: number;
  subscription_code: number;
  full_name: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}
interface UserRec {
  id: number;
  username: string;
  password_hash: string;
  salt: string;
}
interface DB {
  users: UserRec[];
  patients: PatientRec[];
  nextCode: number;
  nextUserId: number;
  nextPatientId: number;
}

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch { /* ignore */ }
  return { users: [], patients: [], nextCode: 101, nextUserId: 1, nextPatientId: 1 };
}
function save(db: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
function nowIso(): string { return new Date().toISOString(); }

function randomBytes(len: number): Uint8Array {
  const a = new Uint8Array(len);
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(a);
      return a;
    }
  } catch { /* fallback */ }
  for (let i = 0; i < len; i++) a[i] = Math.floor(Math.random() * 256);
  return a;
}
function toHex(u8: Uint8Array): string {
  return Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const h = await crypto.subtle.digest('SHA-256', buf);
      return toHex(new Uint8Array(h));
    }
  } catch { /* fallback */ }
  // Non-cryptographic fallback — for demo only.
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}
function saltHex(): string { return toHex(randomBytes(16)); }

// Normalize string for search (mirrors electron/main.ts)
function normalizeStr(s: string): string {
  return s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim().toLowerCase();
}

const webApi: Api = {
  async hasAnyUser() {
    try { return load().users.length > 0; } catch { return false; }
  },
  async createAdmin(...args: any[]) {
    try {
      // Accept either (input) object or (username, password) positional args
      let username: string, password: string;
      if (args.length === 1 && typeof args[0] === 'object') ({ username, password } = args[0] as { username: string; password: string });
      else [username, password] = args as [string, string];
      if (!username || !password) return { ok: false, error: 'missing' };
      const db = load();
      if (db.users.find(u => u.username === username.trim())) return { ok: false, error: 'duplicate' };
      const salt = saltHex();
      const hash = await sha256Hex(salt + password);
      const user: UserRec = { id: db.nextUserId++, username: username.trim(), password_hash: hash, salt };
      db.users.push(user);
      save(db);
      console.log('[webApi] admin created:', user.username);
      return { ok: true };
    } catch (e: any) {
      console.error('[webApi] createAdmin failed', e);
      return { ok: false, error: e?.message || 'unknown' };
    }
  },
  async login(...args: any[]) {
    try {
      let username: string, password: string;
      if (args.length === 1 && typeof args[0] === 'object') ({ username, password } = args[0] as { username: string; password: string });
      else [username, password] = args as [string, string];
      if (!username || !password) return { ok: false as const, error: 'invalid' };
      const db = load();
      const u = db.users.find(x => x.username === username.trim());
      if (!u) return { ok: false as const, error: 'invalid' };
      const h = await sha256Hex(u.salt + password);
      if (h !== u.password_hash) return { ok: false as const, error: 'invalid' };
      console.log('[webApi] login ok:', u.username);
      return { ok: true as const, user: { id: u.id, username: u.username } };
    } catch (e: any) {
      console.error('[webApi] login failed', e);
      return { ok: false as const, error: e?.message || 'unknown' };
    }
  },
  async createPatient(...args: any[]) {
    const input = (args.length === 1 ? args[0] : { full_name: args[0], phone: args[1], address: args[2] }) as { full_name: string; phone: string; address: string };
    const { full_name, phone, address } = input;
    const db = load();
    const now = nowIso();
    const p: PatientRec = {
      id: db.nextPatientId++,
      subscription_code: db.nextCode++,
      full_name: full_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      created_at: now, updated_at: now,
    };
    db.patients.unshift(p);
    save(db);
    return { ok: true, patient: p };
  },
  async updatePatient(input) {
    const { id, full_name, phone, address } = input as any;
    const db = load();
    const p = db.patients.find(x => x.id === id);
    if (!p) return { ok: false, error: 'notfound' };
    p.full_name = full_name.trim();
    p.phone = phone.trim();
    p.address = address.trim();
    p.updated_at = nowIso();
    save(db);
    return { ok: true, patient: p };
  },
  async getPatient(id) {
    const pid = typeof id === 'object' ? (id as any).id : id;
    return load().patients.find(p => p.id === pid) ?? null;
  },
  async searchPatients(...args: any[]) {
    let query: string = args.length === 1 && typeof args[0] !== 'object' ? args[0]
      : args.length === 1 ? (args[0] as any).query ?? '' : '';
    query = (query || '').trim();
    if (!query) return [];
    // Normalize Arabic/Persian digits to ASCII so users can type Persian digits and still match.
    const asciiQ = query.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                       .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const db = load();
    const digitsOnly = asciiQ.replace(/\D/g, '');
    if (/^\d+$/.test(digitsOnly)) {
      const code = parseInt(digitsOnly, 10);
      const found = db.patients.filter(p => p.subscription_code === code);
      if (found.length) return found;
    }
    const nq = normalizeStr(asciiQ);
    return db.patients.filter(p => normalizeStr(p.full_name).includes(nq) || p.phone.includes(digitsOnly))
      .sort((a,b) => b.subscription_code - a.subscription_code);
  },
  async phoneExists(...args: any[]) {
    let phone: string, excludeId: number | undefined;
    if (args.length === 1 && typeof args[0] === 'object') ({ phone, excludeId } = args[0] as { phone: string; excludeId?: number });
    else [phone, excludeId] = args as [string, number | undefined];
    return load().patients.some(p => p.phone === phone && p.id !== excludeId);
  },
  async listPatients(...args: any[]) {
    let page: number, perPage: number, query: string;
    if (args.length === 1 && typeof args[0] === 'object') ({ page, perPage, query } = args[0] as { page: number; perPage: number; query: string });
    else [page, perPage, query] = args as [number, number, string];
    const db = load();
    const raw = (query || '').trim();
    // Normalize Persian/Arabic digits to ASCII for filter matching.
    const q = raw.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                 .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const offset = (page - 1) * perPage;
    let items = db.patients.slice().sort((a,b) => b.subscription_code - a.subscription_code);
    if (q) {
      const nq = normalizeStr(q);
      const digitsOnly = q.replace(/\D/g, '');
      items = items.filter(p => normalizeStr(p.full_name).includes(nq) || p.phone.includes(q) || p.phone.includes(digitsOnly) || String(p.subscription_code).includes(digitsOnly));
    }
    const total = items.length;
    return { rows: items.slice(offset, offset + perPage), total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  },
  async getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const def = { pharmacy_name: 'داروخانه', paper_size: 'A5' as const, sidebar_collapsed: false };
      if (!raw) return def;
      return { ...def, ...JSON.parse(raw) };
    } catch {
      return { pharmacy_name: 'داروخانه', paper_size: 'A5', sidebar_collapsed: false };
    }
  },
  async setSetting(...args: any[]) {
    let key: string, value: string;
    if (args.length === 1 && typeof args[0] === 'object') ({ key, value } = args[0] as { key: string; value: string });
    else [key, value] = args as [string, string];
    const cur = await webApi.getSettings();
    const next = { ...cur, [key]: value === 'true' ? true : value === 'false' ? false : value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    return { ok: true };
  },
  async backup() {
    const db = load();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codepharm-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return { ok: true, path: a.download };
  },
  async restore() {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.db,application/json';
      input.onchange = () => {
        const f = input.files?.[0];
        if (!f) return resolve({ ok: false, error: 'canceled' });
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const obj = JSON.parse(String(reader.result));
            save(obj as DB);
            location.reload();
            resolve({ ok: true });
          } catch { resolve({ ok: false, error: 'invalid' }); }
        };
        reader.readAsText(f);
      };
      input.click();
    });
  },
  async printPatient(data) {
    try {
      const isThermal = data.paperSize === 'thermal80';
      const css = isThermal
        ? `@page{size:80mm auto;margin:4mm;}body{font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;width:72mm;padding:4mm;font-size:11pt;}.ph{text-align:center;font-weight:bold;font-size:13pt;margin-bottom:6mm;}.code{text-align:center;font-size:32pt;font-weight:bold;color:#0E6E73;margin:4mm 0;letter-spacing:2pt;}.row{display:flex;justify-content:space-between;margin:2mm 0;border-bottom:1px dashed #999;padding-bottom:1mm;}.lbl{color:#555;font-size:10pt;}.val{font-weight:bold;}.dt{text-align:center;margin-top:6mm;color:#555;font-size:10pt;}`
        : `@page{size:A5;margin:15mm;}body{font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;padding:10mm;}.ph{text-align:center;font-size:18pt;font-weight:bold;margin-bottom:12mm;color:#0E6E73;}.code{text-align:center;font-size:54pt;font-weight:bold;color:#0E6E73;margin:15mm 0;letter-spacing:4pt;}.row{display:flex;justify-content:space-between;margin:6mm 0;border-bottom:1px solid #ccc;padding-bottom:2mm;font-size:13pt;}.lbl{color:#555;}.val{font-weight:bold;}.dt{text-align:center;margin-top:20mm;color:#555;}`;
      const toFa = (s: any) => String(s).replace(/\d/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'[+d]);
      const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const win = window.open('', '_blank', 'width=700,height=900');
      if (!win) return { ok: false, error: 'popup' };
      win.document.write(`<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>پرینت</title><style>${css}</style></head><body>
        <div class="ph">${esc(data.pharmacyName)}</div>
        <div class="code">${toFa(data.code)}</div>
        <div class="row"><span class="lbl">نام و نام‌خانوادگی:</span><span class="val">${esc(data.name)}</span></div>
        <div class="row"><span class="lbl">شماره تماس:</span><span class="val">${toFa(data.phone)}</span></div>
        <div class="row"><span class="lbl">آدرس:</span><span class="val">${esc(data.address)}</span></div>
        <div class="dt">تاریخ: ${toFa(data.date)}</div>
        <div style="margin-top:15mm;text-align:center;"><button onclick="window.print()" style="padding:8px 24px;font-family:inherit;font-size:12pt;background:#0E6E73;color:#fff;border:0;border-radius:8px;cursor:pointer;">چاپ</button></div>
      </body></html>`);
      win.document.close();
      return { ok: true };
    } catch (e: any) {
      console.error('[webApi] print failed', e);
      return { ok: false, error: e?.message || 'print' };
    }
  },
};

export function installWebApi() {
  if (typeof window !== 'undefined' && !(window as any).api) {
    (window as any).api = webApi;
    // Expose for debugging from console
    (window as any).__cpDebug = { load, save, clear: () => { localStorage.removeItem(DB_KEY); localStorage.removeItem(SETTINGS_KEY); } };
    console.log('[CodEPharm] Web API installed. Use __cpDebug.clear() to reset data.');
  }
}
