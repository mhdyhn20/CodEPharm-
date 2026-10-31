import { BrowserWindow } from 'electron';
import path from 'node:path';

interface PrintData {
  pharmacyName: string;
  code: number;
  name: string;
  phone: string;
  address: string;
  date: string;
  paperSize: 'A5' | 'thermal80';
}

function toPersianDigits(s: string | number): string {
  const map = '۰۱۲۳۴۵۶۷۸۹';
  return String(s).replace(/\d/g, d => map[Number(d)]);
}

export async function printPatientSlip(parent: BrowserWindow | null, data: PrintData): Promise<boolean> {
  const isThermal = data.paperSize === 'thermal80';
  const css = isThermal
    ? `
      @page { size: 80mm auto; margin: 4mm; }
      body { font-family: Tahoma, sans-serif; direction: rtl; font-size: 11pt; width: 72mm; }
      .pharmacy { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 6mm; }
      .code { text-align: center; font-size: 36pt; font-weight: bold; color: #0E6E73; margin: 4mm 0; letter-spacing: 2pt; }
      .row { display: flex; justify-content: space-between; margin: 2mm 0; border-bottom: 1px dashed #999; padding-bottom: 1mm; }
      .label { color: #555; font-size: 10pt; }
      .val { font-weight: bold; }
      .date { text-align: center; margin-top: 6mm; color: #555; font-size: 10pt; }
    `
    : `
      @page { size: A5; margin: 15mm; }
      body { font-family: Tahoma, sans-serif; direction: rtl; padding: 10mm; }
      .pharmacy { text-align: center; font-size: 18pt; font-weight: bold; margin-bottom: 12mm; color: #0E6E73; }
      .code { text-align: center; font-size: 64pt; font-weight: bold; color: #0E6E73; margin: 15mm 0; letter-spacing: 4pt; }
      .row { display: flex; justify-content: space-between; margin: 6mm 0; border-bottom: 1px solid #ccc; padding-bottom: 2mm; font-size: 13pt; }
      .label { color: #555; }
      .val { font-weight: bold; }
      .date { text-align: center; margin-top: 20mm; color: #555; }
    `;

  const html = `<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>برگه اشتراک</title><style>${css}</style></head><body>
    <div class="pharmacy">${escapeHtml(data.pharmacyName)}</div>
    <div class="code">${toPersianDigits(data.code)}</div>
    <div class="row"><span class="label">نام و نام‌خانوادگی:</span><span class="val">${escapeHtml(data.name)}</span></div>
    <div class="row"><span class="label">شماره تماس:</span><span class="val">${toPersianDigits(data.phone)}</span></div>
    <div class="row"><span class="label">آدرس:</span><span class="val">${escapeHtml(data.address)}</span></div>
    <div class="date">تاریخ: ${toPersianDigits(data.date)}</div>
  </body></html>`;

  // Print preview via a new BrowserWindow
  const win = new BrowserWindow({
    parent: parent ?? undefined,
    modal: false,
    width: isThermal ? 520 : 700,
    height: isThermal ? 760 : 900,
    title: 'پیش‌نمایش چاپ',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);

  const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  await win.loadURL(dataUrl);

  return new Promise<boolean>(resolve => {
    win.webContents.print(
      {
        silent: false,
        printBackground: true,
        margins: { marginType: 'none' },
      },
      (success, err) => {
        if (!win.isDestroyed()) win.close();
        resolve(success && !err);
      }
    );
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
