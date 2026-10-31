# کد ای فارم (CodEPharm)

نسخه‌ی آفلاین دسکتاپ ویندوز برای مدیریت مشترکان داروخانه.

این README هم برای کاربران نهایی (غیرفنی) و هم برای توسعه‌دهنده است.
بخش کاربری در بالای فایل و بخش فنی در انتهای فایل آمده است.

## پیش‌نمایش آنلاین (دمو)

اگر می‌خواهید قبل از نصب، برنامه را در مرورگر امتحان کنید:
👉 **https://mhdyhn20.github.io/CodEPharm-/**  
(برای فعال شدن این آدرس، یک‌بار Pages را از تنظیمات گیت‌هاب روشن کنید — راهنما پایین‌تر).

## دانلود نسخه ویندوز (نصب‌کننده .exe)

همیشه آخرین نسخه از این صفحه قابل دانلود است:
👉 **https://github.com/mhdyhn20/CodEPharm-/releases/tag/latest**

فایل `CodEPharm.Setup.1.0.0.exe` را دانلود و اجرا کنید. این فایل در هر push به‌صورت خودکار توسط GitHub Actions روی یک ماشین ویندوز ساخته و در این Release آپلود می‌شود.

---

## راهنمای کاربر (فارسی)

### ۱. نصب برنامه
1. فایل نصب `CodEPharm-Setup-1.0.0.exe` را از پوشه‌ی `release` اجرا کنید.
2. در پنجره‌ی نصب روی «Next» و سپس «Install» کلیک کنید. نصب در پوشه‌ی کاربری شما انجام می‌شود (نیازی به دسترسی ادمین نیست).
3. در پایان، گزینه‌ی «Launch CodEPharm» را تیک بزنید و «Finish» کنید.
4. یک آیکون روی دسکتاپ و یک میان‌بر در منوی استارت ساخته می‌شود.

> داده‌های شما (فهرست بیماران و حساب کاربری) در پوشه‌ی مخصوص کاربر ویندوز ذخیره می‌شود و با نصب/حذف دوباره‌ی برنامه پاک نمی‌شود.

### ۲. اولین ورود (ساخت حساب مدیر)
در اولین اجرای برنامه، از شما خواسته می‌شود یک حساب کاربری مدیر بسازید:
- نام کاربری و رمز عبور دلخواه خود را وارد کنید (رمز حداقل ۶ کاراکتر).
- روی «ساخت حساب» کلیک کنید.
- از این پس با همین نام کاربری و رمز وارد برنامه می‌شوید.

### ۳. استفاده‌ی روزانه
- **صفحه اصلی:** کد اشتراک (مثل ۱۰۱) یا بخشی از نام بیمار را وارد کرده و «تایید» را بزنید.
  - اگر کد دقیق باشد، برگه‌ی اطلاعات بیمار باز می‌شود.
  - اگر چند نتیجه پیدا شود، فهرستی برای انتخاب نمایش داده می‌شود.
  - اگر نتیجه‌ای پیدا نشود، پیام دوستانه نمایش داده می‌شود.
- **ایجاد کد جدید:** نام کامل، شماره موبایل (۰۹xxxxxxxxx) و آدرس را وارد کنید. پس از ثبت، کد اشتراک جدید در یک کادر سبز بزرگ نمایش داده می‌شود و می‌توانید مستقیماً پرینت بگیرید.
- **همه مشترکان:** جدول قابل جستجو با ۱۰ ردیف در هر صفحه و دکمه‌های ویرایش و پرینت.
- **تنظیمات:**
  - ویرایش نام داروخانه (روی برگه چاپ می‌شود).
  - انتخاب اندازه کاغذ (A5 یا حرارتی ۸۰ میلی‌متر).
  - پشتیبان‌گیری و بازیابی پایگاه داده.
- **درباره ما:** اطلاعات برنامه.
- **خروج:** از نوار کناری.

### ۴. پرینت برگه اشتراک
- روی دکمه «پرینت» در پنجره‌ی اطلاعات بیمار یا ویرایش، یا ستون عملیات در فهرست مشترکان کلیک کنید.
- یک پنجره‌ی پیش‌نمایش چاپ باز می‌شود. چاپگر مورد نظر را انتخاب و چاپ کنید.
- برای انتخاب کاغذ حرارتی ۸۰mm به «تنظیمات» بروید.

### ۵. پشتیبان‌گیری (حتماً انجام دهید!)
- به صورت **خودکار** در هر بار بستن برنامه، یک نسخه پشتیبان در پوشه‌ی داخلی برنامه ذخیره می‌شود (آخرین ۵ نسخه نگه‌داری می‌شود).
- برای تهیه‌ی پشتیبان دستی و ذخیره روی فلش مموری یا هارد اکسترنال:
  1. به «تنظیمات» بروید.
  2. روی «تهیه پشتیبان» کلیک کنید.
  3. مسیر و نام فایل را انتخاب کنید (ترجیحاً در حافظه‌ی جانبی).
- برای بازیابی: روی «انتخاب فایل و بازیابی» کلیک کنید و فایل `.db` پشتیبان را انتخاب کنید. **هشدار:** بازیابی، اطلاعات فعلی را جایگزین می‌کند.

### ۶. حذف برنامه
از «افزودن یا حذف برنامه‌ها» در ویندوز استفاده کنید. **توجه:** پایگاه داده و پشتیبان‌های خودکار شما حذف نمی‌شوند تا از از دست رفتن ناخواسته‌ی داده‌ها جلوگیری شود.

---

## Developer Guide

### Tech Stack
- Electron 32 + React 18 + TypeScript 5 + Vite 5
- Tailwind CSS 3 (RTL-aware styling via logical properties)
- sql.js (WASM-compiled SQLite; no native rebuild needed) persisted to `userData/codepharm.db`
- HMAC-SHA256 password hashing with per-user salt (stdlib `crypto`)
- Printing via Electron `webContents.print()` from a separate preview window
- electron-builder (NSIS installer for Windows, per-user install)

### Project Structure
```
├── electron/            # Main process (TypeScript)
│   ├── main.ts          # BrowserWindow + IPC handlers
│   ├── preload.ts       # contextBridge API (typed)
│   ├── db.ts            # sql.js init, migrations, persistence
│   ├── crypto.ts        # Password hashing/verification
│   └── print.ts         # Print slip HTML + print preview
├── src/                 # Renderer (React + TS)
│   ├── components/      # UI primitives, sidebar, dialogs
│   ├── pages/           # Login / Home / Create / All / About / Settings
│   ├── lib/             # digits, normalize, validation, jalali
│   ├── constants/       # All Persian UI strings (strings.ts)
│   ├── context/         # AppContext (auth + settings)
│   ├── types/           # Shared TS types
│   └── App.tsx
├── assets/fonts/        # Vazirmatn (fallback until user supplies brand font)
├── build/               # App icon (PNG generated from scripts/make-icon.cjs)
├── scripts/             # Build / smoke scripts
├── tests/               # Vitest unit tests for utils
└── release/             # Installer output (after build)
```

### Data Model
- **users**: id, username (unique), password_hash, salt, created_at
- **patients**: id, subscription_code (unique, starting 101, auto-increment, non-editable), full_name, phone, address, created_at, updated_at
- **settings**: key/value store (pharmacy_name, paper_size, sidebar_collapsed, next_subscription_code)

### Scripts
```bash
npm install           # install dependencies (first time; ~150MB incl. Electron)
npm run dev           # start Vite + Electron in dev mode (hot reload)
npm run lint          # type-check both main and renderer
npm test              # run Vitest unit tests
npm run build         # compile TypeScript + bundle renderer + copy wasm
npm run dist          # produce Windows NSIS installer into release/
```

### Important notes for building the Windows installer
1. Run the build on a Windows machine (or a CI with Windows + Wine/NSIS).
2. Ensure Node.js 20+ and npm 10+ are installed.
3. After `npm install`, Electron will download its Windows binary automatically.
4. Run `npm run dist`. The output `release/CodEPharm Setup 1.0.0.exe` is the installer.
5. The `codepharm.db` file is stored in `%APPDATA%/CodEPharm/` (resolved via `app.getPath('userData')`) and is NOT removed on uninstall.
6. Automatic backups live in `%APPDATA%/CodEPharm/backups/` (last 5 retained).

### Security
- `contextIsolation: true`, `nodeIntegration: false`
- CSP header blocks all remote sources (offline-only).
- Passwords never stored in plaintext; constant-time compare (`timingSafeEqual`).
- No network calls anywhere in the codebase.

### Assumptions made
- Subscription codes start at 101 and increment by 1; codes are **never reused or editable**.
- Phone validation is a soft-warn on duplicates (does not block).
- "Delete patient" was intentionally omitted per the brief; data is append-only.
- Built-in icon is a generated placeholder (teal rounded square with stylised C + green cross) and should be replaced with your actual brand mark when you provide the `/assets/fonts` and brand SVG/PNG.
- Font fallback: Vazirmatn is bundled; replace with your custom font by dropping files into `assets/fonts/` and updating `src/index.css` `@font-face` declarations.
- Jalali calendar uses a well-known Borkowski-derived algorithm (validated via unit tests).
- Paper sizes supported: A5 and 80mm thermal; A5 is default.
- Pagination: 10 rows per page.
- The user supplied no Figma screenshots or brand font files in this repository, so the UI follows the written spec with a clean Win11-inspired interpretation of the described palette.

### Known limitations
- The app has been type-checked and renderer-built in this Linux sandbox; **the Windows `.exe` installer must be produced on a Windows host** because Electron binaries for Windows could not be downloaded here (network policy). Source code, Vite production bundle, and all compile steps pass. Smoke tests for the DB layer (sql.js) pass in Node. Unit tests pass (10/10).
- No native module is used, so no post-install rebuild is required — this greatly simplifies installation on Windows.
- The print flow uses the OS print dialog; native thermal-printer drivers must be installed for the 80mm mode to print directly to a thermal printer from Windows.

### How to rebuild the installer on Windows (step-by-step)
1. Install Node.js LTS (v20 or v22) from https://nodejs.org/ — accept defaults, make sure "Add to PATH" is checked.
2. (If on a corporate network that blocks npm:) install Git for Windows, then from a terminal:
   ```
   git clone <repo-url> CodEPharm
   cd CodEPharm
   npm install
   ```
3. Double-check the installer config in `package.json` (product name, version, icon) and adjust if needed.
4. Build:
   ```
   npm run dist
   ```
5. The installer ends up at `release/CodEPharm Setup 1.0.0.exe`. Distribute that single file.
