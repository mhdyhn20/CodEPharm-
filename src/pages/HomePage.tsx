import React, { useState, useRef, useEffect, useCallback } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { STR } from '@/constants/strings';
import { toPersianDigits } from '@/lib/digits';
import { toEnglishDigits, numericInput } from '@/lib/digits';
import { PatientInfoDialog, EditPatientDialog } from '@/components/dialogs/PatientDialogs';
import type { Patient } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import { formatJalali } from '@/lib/jalali';

interface Props {
  onNavigate: (p: 'create') => void;
}

export const HomePage: React.FC<Props> = ({ onNavigate }) => {
  const { settings } = useApp();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [results, setResults] = useState<Patient[] | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [stats, setStats] = useState<{ total: number; nextCode: number; lastCode: number; lastCreatedAt: string | null; lastPatient: { full_name: string; code: number } | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshStats = useCallback(async () => {
    try { setStats(await window.api.stats()); } catch {}
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    refreshStats();
    const onFocusSearch = () => setTimeout(() => inputRef.current?.focus(), 10);
    window.addEventListener('cp:focus-search', onFocusSearch as EventListener);
    const iv = setInterval(refreshStats, 30000); // auto-refresh while on home
    return () => {
      window.removeEventListener('cp:focus-search', onFocusSearch as EventListener);
      clearInterval(iv);
    };
  }, [refreshStats]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setEmpty(false);
    setResults(null);
    // Normalize digits before sending (so ASCII lookup works even for Persian-typed code)
    const normalized = toEnglishDigits(query);
    const r = await window.api.searchPatients(normalized);
    setLoading(false);
    if (!r || r.length === 0) {
      setEmpty(true);
    } else if (r.length === 1) {
      openPatient(r[0] as Patient);
    } else {
      setResults(r as Patient[]);
    }
  };

  const openPatient = (p: Patient) => {
    setPatient(p);
    setShowInfo(true);
    setResults(null);
    setEmpty(false);
  };

  const handlePrint = async () => {
    if (!patient) return;
    const r = await window.api.printPatient({
      pharmacyName: settings.pharmacy_name,
      code: patient.subscription_code,
      name: patient.full_name,
      phone: patient.phone,
      address: patient.address,
      date: formatJalali(new Date()),
      paperSize: settings.paper_size as 'A5' | 'thermal80',
    });
    if (r.ok) toast.show('چاپ با موفقیت ارسال شد.', 'success');
  };

  const StatCard: React.FC<{ label: string; value: string; sub?: string; icon: React.ReactNode; tone: 'brand'|'success'|'ink'; className?: string }> = ({ label, value, sub, icon, tone, className }) => {
    const palette = {
      brand: { bg: 'bg-brand-50', fg: 'text-brand', ring: 'ring-brand/10' },
      success: { bg: 'bg-success/10', fg: 'text-success', ring: 'ring-success/10' },
      ink: { bg: 'bg-surface-muted', fg: 'text-ink', ring: 'ring-surface-border' },
    }[tone];
    return (
      <div className={`card p-4 flex items-center gap-3 shadow-card ${className || ''}`}>
        <div className={`w-11 h-11 rounded-xl ${palette.bg} ${palette.fg} flex items-center justify-center shrink-0 ring-1 ${palette.ring}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-ink-muted mb-0.5">{label}</div>
          <div className={`text-xl font-bold ${palette.fg} tracking-tight`}>{value}</div>
          {sub && <div className="text-[11px] text-ink-muted truncate">{sub}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{STR.home.title}</h1>
          <p className="text-ink-muted mt-1">{STR.home.subtitle}</p>
        </div>
        <Button variant="secondary" icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" strokeLinecap="round" />
            <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
          </svg>
        } onClick={() => onNavigate && onNavigate('create')}>
          ثبت بیمار جدید
        </Button>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="کل مشترکان"
          value={toPersianDigits(stats?.total ?? 0)}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          tone="brand"
        />
        <StatCard
          label="کد بعدی"
          value={toPersianDigits(stats?.nextCode ?? 101)}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            </svg>
          }
          tone="success"
        />
        <StatCard
          label="آخرین کد ثبت‌شده"
          value={stats?.lastCode ? toPersianDigits(stats.lastCode) : '—'}
          sub={stats?.lastPatient?.full_name}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
            </svg>
          }
          tone="ink"
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            ref={inputRef}
            value={q}
            onChange={numericInput(v => { setQ(v); setEmpty(false); setResults(null); })}
            placeholder={STR.home.searchPlaceholder}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
            }
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button type="submit" loading={loading}>{STR.common.confirm}</Button>
            <div className="flex items-center gap-2 text-[11px] text-ink-faint" dir="ltr">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-ink-muted text-[10px] font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-ink-muted text-[10px] font-mono">K</kbd>
              <span className="ms-2">جستجو</span>
              <span className="mx-2">·</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-ink-muted text-[10px] font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-ink-muted text-[10px] font-mono">N</kbd>
              <span className="ms-2">ثبت جدید</span>
            </div>
          </div>
        </form>

        {empty && (
          <div className="mt-6 border border-dashed border-surface-border rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0E6E73" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-ink-soft font-medium">{STR.home.emptyState}</p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-ink-muted mb-3">{STR.home.multipleMatches}</p>
            <div className="divide-y divide-surface-border border border-surface-border rounded-xl overflow-hidden">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => openPatient(p)}
                  className="w-full text-right flex items-center justify-between px-4 py-3 hover:bg-brand-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-ink">{p.full_name}</div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {toPersianDigits(p.phone)}
                    </div>
                  </div>
                  <div className="text-lg font-bold text-brand">{toPersianDigits(p.subscription_code)}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <PatientInfoDialog
        open={showInfo}
        patient={patient}
        onClose={() => setShowInfo(false)}
        onEdit={() => { setShowInfo(false); setShowEdit(true); }}
        onPrint={handlePrint}
      />
      <EditPatientDialog
        open={showEdit}
        patient={patient}
        onClose={() => setShowEdit(false)}
        onSaved={(p) => {
          setPatient(p);
          setShowEdit(false);
          setShowInfo(true);
          toast.show('اطلاعات با موفقیت به‌روز شد.', 'success');
        }}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default HomePage;
