import React, { useState, useRef, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { STR } from '@/constants/strings';
import { toPersianDigits } from '@/lib/digits';
import { toEnglishDigits } from '@/lib/digits';
import { PatientInfoDialog, EditPatientDialog } from '@/components/dialogs/PatientDialogs';
import type { Patient } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import { formatJalali } from '@/lib/jalali';

interface Props {
  onNavigate: (p: 'create') => void;
}

export const HomePage: React.FC<Props> = () => {
  const { settings } = useApp();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [results, setResults] = useState<Patient[] | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{STR.home.title}</h1>
        <p className="text-ink-muted mt-1">{STR.home.subtitle}</p>
      </header>

      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setEmpty(false); setResults(null); }}
            placeholder={STR.home.searchPlaceholder}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
              </svg>
            }
          />
          <div className="flex justify-start">
            <Button type="submit" loading={loading}>{STR.common.confirm}</Button>
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
