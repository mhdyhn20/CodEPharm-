import React, { useEffect, useState } from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { STR } from '@/constants/strings';
import { toPersianDigits } from '@/lib/digits';
import { formatJalali } from '@/lib/jalali';
import { normalizePhone, validatePatient } from '@/lib/validation';
import type { Patient } from '@/types';

interface InfoProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
}

export const PatientInfoDialog: React.FC<InfoProps> = ({ open, patient, onClose, onEdit, onPrint }) => {
  if (!patient) return null;
  return (
    <Dialog open={open} onClose={onClose} title={STR.patient.infoTitle}>
      <div className="space-y-4">
        <div className="flex justify-center py-3">
          <div className="bg-brand-50 border-2 border-brand/20 rounded-2xl px-8 py-4 text-center">
            <div className="text-xs text-ink-muted mb-1">{STR.patient.code}</div>
            <div className="text-4xl font-bold text-brand tracking-widest">{toPersianDigits(patient.subscription_code)}</div>
          </div>
        </div>
        <InfoRow label={STR.patient.name} value={patient.full_name} />
        <InfoRow label={STR.patient.phone} value={toPersianDigits(patient.phone)} />
        <InfoRow label={STR.patient.address} value={patient.address || '—'} multiline />
        <InfoRow label={STR.patient.createdAt} value={toPersianDigits(formatJalali(patient.created_at))} />
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-surface-border">
        <Button variant="secondary" onClick={onPrint}>
          {STR.common.print}
        </Button>
        <Button onClick={onEdit}>{STR.common.edit}</Button>
      </div>
    </Dialog>
  );
};

const InfoRow: React.FC<{ label: string; value: string; multiline?: boolean }> = ({ label, value, multiline }) => (
  <div className={`bg-surface-muted rounded-xl p-3 ${multiline ? '' : ''}`}>
    <div className="text-xs text-ink-muted mb-1">{label}</div>
    <div className={`text-ink ${multiline ? 'whitespace-pre-wrap leading-7' : ''}`}>{value}</div>
  </div>
);

interface EditProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSaved: (p: Patient) => void;
  onPrint: () => void;
}

export const EditPatientDialog: React.FC<EditProps> = ({ open, patient, onClose, onSaved, onPrint }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [phoneWarn, setPhoneWarn] = useState('');

  useEffect(() => {
    if (patient && open) {
      setName(patient.full_name);
      setPhone(patient.phone);
      setAddress(patient.address);
      setErrors({});
      setPhoneWarn('');
    }
  }, [patient, open]);

  if (!patient) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const v = validatePatient(name, normalizePhone(phone));
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    const r = await window.api.updatePatient({
      id: patient.id,
      full_name: name.trim(),
      phone: normalizePhone(phone),
      address: address.trim(),
    });
    setLoading(false);
    if (r.ok) {
      onSaved(r.patient as Patient);
    }
  };

  const handlePhoneBlur = async () => {
    const p = normalizePhone(phone);
    if (!p || !/^09\d{9}$/.test(p)) { setPhoneWarn(''); return; }
    const exists = await window.api.phoneExists(p, patient.id);
    setPhoneWarn(exists ? STR.validation.phoneWarn : '');
  };

  return (
    <Dialog open={open} onClose={onClose} title={STR.patient.editTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-brand-50 border border-brand/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-ink-soft">{STR.patient.code}</span>
          <span className="text-xl font-bold text-brand">{toPersianDigits(patient.subscription_code)}</span>
        </div>
        <Input
          label={STR.create.name}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={STR.create.namePlaceholder}
          error={errors.name}
          autoFocus
        />
        <Input
          label={STR.create.phone}
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onBlur={handlePhoneBlur}
          placeholder={STR.create.phonePlaceholder}
          error={errors.phone}
          hint={phoneWarn}
          inputMode="numeric"
        />
        <Textarea
          label={STR.create.address}
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder={STR.create.addressPlaceholder}
        />
        <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
          <Button type="button" variant="secondary" onClick={onPrint}>
            {STR.common.print}
          </Button>
          <Button type="submit" loading={loading}>{STR.patient.saveEdit}</Button>
        </div>
      </form>
    </Dialog>
  );
};

interface SuccessProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onCreateNew: () => void;
  onPrint: () => void;
}

export const SuccessDialog: React.FC<SuccessProps> = ({ open, patient, onClose, onCreateNew, onPrint }) => {
  if (!patient) return null;
  return (
    <Dialog open={open} onClose={onClose} title={STR.success.title} closeOnEsc={false}>
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2FBFA3" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-ink font-medium mb-5">{STR.success.subtitle}</p>
        <div className="bg-success/10 border-2 border-success/40 rounded-2xl px-10 py-5 w-full">
          <div className="text-xs text-ink-muted mb-1">{STR.patient.code}</div>
          <div className="text-5xl font-bold text-success tracking-widest">{toPersianDigits(patient.subscription_code)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-surface-border">
        <Button onClick={onPrint} icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polyline points="6 9 6 2 18 2 18 9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        }>{STR.success.print}</Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            {STR.success.done}
          </Button>
          <Button type="button" variant="ghost" className="flex-1" onClick={onCreateNew}>
            {STR.success.newOne}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
