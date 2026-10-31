import React, { useEffect, useState, useCallback } from 'react';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import { STR } from '@/constants/strings';
import { toPersianDigits } from '@/lib/digits';
import { PatientInfoDialog, EditPatientDialog } from '@/components/dialogs/PatientDialogs';
import type { Patient, PaginatedPatients } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import { formatJalali } from '@/lib/jalali';

const PER_PAGE = 10;

export const AllCustomersPage: React.FC = () => {
  const { settings } = useApp();
  const toast = useToast();
  const [data, setData] = useState<PaginatedPatients | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const r = await window.api.listPatients(p, PER_PAGE, q);
      setData(r as PaginatedPatients);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, debounced);
  }, [page, debounced, load]);

  // reset to page 1 when query changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const openPatient = (p: Patient) => {
    setSelected(p);
    setShowInfo(true);
  };

  const handlePrint = async () => {
    if (!selected) return;
    await window.api.printPatient({
      pharmacyName: settings.pharmacy_name,
      code: selected.subscription_code,
      name: selected.full_name,
      phone: selected.phone,
      address: selected.address,
      date: formatJalali(new Date()),
      paperSize: settings.paper_size as 'A5' | 'thermal80',
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{STR.all.title}</h1>
        <p className="text-ink-muted mt-1">{STR.all.subtitle}</p>
      </header>

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={STR.all.searchPlaceholder}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted text-ink-soft text-xs font-medium sticky top-0">
                <th className="text-right px-6 py-3 font-medium w-20">{STR.all.cols.row}</th>
                <th className="text-right px-4 py-3 font-medium">{STR.all.cols.name}</th>
                <th className="text-right px-4 py-3 font-medium w-48">{STR.all.cols.phone}</th>
                <th className="text-right px-4 py-3 font-medium w-36">{STR.all.cols.code}</th>
                <th className="text-right px-6 py-3 font-medium w-28">{STR.all.cols.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-muted">{STR.common.loading}</td>
                </tr>
              )}
              {!loading && data && data.rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-ink-muted">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#B0BBC0" strokeWidth="1.4">
                        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
                      </svg>
                      {STR.common.noResult}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && data && data.rows.map((p, i) => {
                const rowNo = (data.page - 1) * PER_PAGE + i + 1;
                return (
                  <tr key={p.id} className="border-t border-surface-border hover:bg-brand-50/50 transition-colors">
                    <td className="px-6 py-3 text-ink-muted">{toPersianDigits(rowNo)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{p.full_name}</td>
                    <td className="px-4 py-3 text-ink-soft ltr-dir" dir="ltr">{toPersianDigits(p.phone)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-brand-50 text-brand font-bold rounded-lg px-2.5 py-1 text-sm tracking-wider">
                        {toPersianDigits(p.subscription_code)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        <IconButton label={STR.common.edit} onClick={() => openPatient(p)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.12 2.12 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </IconButton>
                        <IconButton label={STR.common.print} onClick={() => { setSelected(p); handlePrint(); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <polyline points="6 9 6 2 18 2 18 9" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data && <Pagination page={data.page} totalPages={data.totalPages} total={data.total} perPage={PER_PAGE} onChange={setPage} />}
      </div>

      <PatientInfoDialog
        open={showInfo}
        patient={selected}
        onClose={() => setShowInfo(false)}
        onEdit={() => { setShowInfo(false); setShowEdit(true); }}
        onPrint={handlePrint}
      />
      <EditPatientDialog
        open={showEdit}
        patient={selected}
        onClose={() => setShowEdit(false)}
        onSaved={(p) => {
          setSelected(p);
          setShowEdit(false);
          load(page, debounced);
          toast.show('اطلاعات با موفقیت به‌روز شد.', 'success');
        }}
        onPrint={handlePrint}
      />
    </div>
  );
};

const IconButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-brand hover:bg-brand-50 transition-colors"
  >
    {children}
  </button>
);

export default AllCustomersPage;
