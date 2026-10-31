import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { STR } from '@/constants/strings';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const toast = useToast();
  const [name, setName] = useState(settings.pharmacy_name);
  const [busyBackup, setBusyBackup] = useState(false);
  const [busyRestore, setBusyRestore] = useState(false);

  const saveName = () => {
    updateSettings({ pharmacy_name: name.trim() || 'داروخانه' });
    toast.show('نام داروخانه ذخیره شد.', 'success');
  };

  const setPaper = (ps: 'A5' | 'thermal80') => {
    updateSettings({ paper_size: ps });
    toast.show('اندازه کاغذ به‌روز شد.', 'success');
  };

  const doBackup = async () => {
    setBusyBackup(true);
    const r = await window.api.backup();
    setBusyBackup(false);
    if (r.ok) toast.show(STR.settings.backupOk, 'success');
    else if (r.error !== 'canceled') toast.show('خطا در پشتیبان‌گیری.', 'error');
  };

  const doRestore = async () => {
    if (!confirm(STR.settings.restoreWarn)) return;
    setBusyRestore(true);
    const r = await window.api.restore();
    setBusyRestore(false);
    if (r.ok) {
      toast.show(STR.settings.restoreOk, 'success');
      setTimeout(() => location.reload(), 1500);
    } else if (r.error !== 'canceled') {
      toast.show('خطا در بازیابی.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-ink">{STR.settings.title}</h1>
      </header>

      <section className="card">
        <h3 className="font-bold text-ink mb-1">اطلاعات داروخانه</h3>
        <p className="text-sm text-ink-muted mb-4">این اطلاعات در بالای برگه چاپی نمایش داده می‌شود.</p>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              label={STR.settings.pharmacyName}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={STR.settings.pharmacyNamePlaceholder}
            />
          </div>
          <Button onClick={saveName}>{STR.common.save}</Button>
        </div>
      </section>

      <section className="card">
        <h3 className="font-bold text-ink mb-1">{STR.print.title}</h3>
        <p className="text-sm text-ink-muted mb-4">اندازه کاغذ پیش‌فرض برای چاپ را انتخاب کنید.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPaper('A5')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              settings.paper_size === 'A5'
                ? 'border-brand bg-brand-50 text-brand'
                : 'border-surface-border text-ink-soft hover:border-brand/40'
            }`}
          >
            {STR.settings.paperA5}
          </button>
          <button
            onClick={() => setPaper('thermal80')}
            className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${
              settings.paper_size === 'thermal80'
                ? 'border-brand bg-brand-50 text-brand'
                : 'border-surface-border text-ink-soft hover:border-brand/40'
            }`}
          >
            {STR.settings.paperThermal}
          </button>
        </div>
      </section>

      <section className="card">
        <h3 className="font-bold text-ink mb-1">پشتیبان‌گیری و بازیابی</h3>
        <p className="text-sm text-ink-muted mb-4">بهتر است به صورت دوره‌ای یک نسخه پشتیبان در حافظه جانبی ذخیره کنید. برنامه در هر بار بسته شدن نیز به صورت خودکار پشتیبان تهیه می‌کند.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={doBackup}
            disabled={busyBackup}
            className="border border-surface-border rounded-xl p-4 text-right hover:border-brand hover:bg-brand-50 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-ink">{STR.settings.backup}</div>
                <div className="text-xs text-ink-muted">{STR.settings.backupDesc}</div>
              </div>
            </div>
            <Button variant="secondary" className="w-full" loading={busyBackup} onClick={e => { e.stopPropagation(); doBackup(); }}>
              {STR.settings.doBackup}
            </Button>
          </button>

          <button
            onClick={doRestore}
            disabled={busyRestore}
            className="border border-surface-border rounded-xl p-4 text-right hover:border-warning hover:bg-yellow-50 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 text-warning flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-ink">{STR.settings.restore}</div>
                <div className="text-xs text-ink-muted">{STR.settings.restoreDesc}</div>
              </div>
            </div>
            <Button variant="secondary" className="w-full" loading={busyRestore} onClick={e => { e.stopPropagation(); doRestore(); }}>
              {STR.settings.doRestore}
            </Button>
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
