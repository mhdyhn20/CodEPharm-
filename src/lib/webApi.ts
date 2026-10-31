// Web (browser) implementation of the same API exposed by electron/preload.ts.
// Uses localStorage + a tiny JSON store so the app can run as a preview on GitHub Pages.
// When running inside Electron, window.api is provided by preload.ts; this shim only activates in browser.

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

function nowIso(): string {
  return new Date().toISOString();
}

// ---- Crypto (mirrors electron/crypto.ts using Web Crypto where possible; sha256 hmac with simple fallback) ----
async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // simple sha256 (no salt separation — for demo only)
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // tiny hash fallback (demo only)
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function saltHex(): string {
  const a = new Uint8Array(16);
  const c = (typeof crypto !== 'undefined' ? crypto : ((window as any).msCrypto as typeof crypto));
  c.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

const webApi: Api = {
  async hasAnyUser() {
    return load().users.length > 0;
  },
  async createAdmin(input) {
    const { username, password } = input as any as { username: string; password: string };
    const db = load();
    if (db.users.find(u => u.username === username.trim())) {
      return { ok: false, error: 'duplicate' };
    }
    const salt = saltHex();
    const hash = await sha256Hex(salt + password);
    const user: UserRec = {
      id: db.nextUserId++,
      username: username.trim(),
      password_hash: hash,
      salt,
    };
    db.users.push(user);
    save(db);
    return { ok: true };
  },
  async login(input) {
    const { username, password } = input as any as { username: string; password: string };
    const db = load();
    const u = db.users.find(x => x.username === username.trim());
    if (!u) return { ok: false as const, error: 'invalid' };
    const h = await sha256Hex(u.salt + password);
    if (h !== u.password_hash) return { ok: false as const, error: 'invalid' };
    return { ok: true as const, user: { id: u.id, username: u.username } };
  },

  async createPatient(input) {
    const { full_name, phone, address } = input as any as { full_name: string; phone: string; address: string };
    const db = load();
    const now = nowIso();
    const p: PatientRec = {
      id: db.nextPatientId++,
      subscription_code: db.nextCode++,
      full_name: full_name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      created_at: now,
      updated_at: now,
    };
    db.patients.unshift(p);
    save(db);
    return { ok: true, patient: p };
  },
  async updatePatient(input) {
    const { id, full_name, phone, address } = input as any as { id: number; full_name: string; phone: string; address: string };
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
  async searchPatients(input) {
    const query = (typeof input === 'string' ? input : (input as any).query) as string;
    const q = (query || '').trim();
    if (!q) return [];
    const db = load();
    const digitsOnly = q.replace(/\D/g, '');
    if (/^\d+$/.test(digitsOnly)) {
      const code = parseInt(digitsOnly, 10);
      const exact = db.patients.filter(p => p.subscription_code === code);
      if (exact.length) return exact;
    }
    const normalize = (s: string) => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim().toLowerCase();
    const nq = normalize(q);
    return db.patients.filter(p => normalize(p.full_name).includes(nq) || p.phone.includes(digitsOnly))
      .sort((a,b) => b.subscription_code - a.subscription_code);
  },
  async phoneExists(input) {
    const { phone, excludeId } = input as any as { phone: string; excludeId?: number };
    const db = load();
    return db.patients.some(p => p.phone === phone && p.id !== excludeId);
  },
  async listPatients(input) {
    const { page, perPage, query } = input as any as { page: number; perPage: number; query: string };
    const db = load();
    const q = (query || '').trim();
    const normalize = (s: string) => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim().toLowerCase();
    let items = db.patients.slice().sort((a,b) => b.subscription_code - a.subscription_code);
    if (q) {
      const nq = normalize(q);
      const digitsOnly = q.replace(/\D/g, '');
      items = items.filter(p => normalize(p.full_name).includes(nq) || p.phone.includes(q) || String(p.subscription_code).includes(digitsOnly));
    }
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const rows = items.slice((page - 1) * perPage, page * perPage);
    return { rows, total, page, perPage, totalPages };
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
  async setSetting(input) {
    const { key, value } = input as any as { key: string; value: string };
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
    URL.revokeObjectURL(url);
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
          } catch {
            resolve({ ok: false, error: 'invalid' });
          }
        };
        reader.readAsText(f);
      };
      input.click();
    });
  },

  async printPatient(data) {
    // In-browser print: open preview in new window
    const isThermal = data.paperSize === 'thermal80';
    const css = isThermal
      ? `@page { size: 80mm auto; margin: 4mm; } body{font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;width:72mm;padding:4mm;font-size:11pt;} .ph{text-align:center;font-weight:bold;font-size:13pt;margin-bottom:6mm;} .code{text-align:center;font-size:32pt;font-weight:bold;color:#0E6E73;margin:4mm 0;letter-spacing:2pt;} .row{display:flex;justify-content:space-between;margin:2mm 0;border-bottom:1px dashed #999;padding-bottom:1mm;} .lbl{color:#555;font-size:10pt;} .val{font-weight:bold;} .dt{text-align:center;margin-top:6mm;color:#555;font-size:10pt;}`
      : `@page { size: A5; margin: 15mm; } body{font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;padding:10mm;} .ph{text-align:center;font-size:18pt;font-weight:bold;margin-bottom:12mm;color:#0E6E73;} .code{text-align:center;font-size:54pt;font-weight:bold;color:#0E6E73;margin:15mm 0;letter-spacing:4pt;} .row{display:flex;justify-content:space-between;margin:6mm 0;border-bottom:1px solid #ccc;padding-bottom:2mm;font-size:13pt;} .lbl{color:#555;} .val{font-weight:bold;} .dt{text-align:center;margin-top:20mm;color:#555;}`;
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
  },
};

export function installWebApi() {
  // Only install when window.api is not already provided by Electron preload.
  if (typeof window !== 'undefined' && !(window as any).api) {
    (window as any).api = webApi;
  }
}
