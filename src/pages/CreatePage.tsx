import React, { useState, useRef, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { STR } from '@/constants/strings';
import { normalizePhone, validatePatient } from '@/lib/validation';
import { SuccessDialog } from '@/components/dialogs/PatientDialogs';
import type { Patient } from '@/types';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';
import { formatJalali } from '@/lib/jalali';

export const CreatePage: React.FC = () => {
  const { settings } = useApp();
  const toast = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneWarn, setPhoneWarn] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPatient, setNewPatient] = useState<Patient | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const reset = () => {
    setName(''); setPhone(''); setAddress('');
    setErrors({}); setPhoneWarn('');
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handlePhoneBlur = async () => {
    const p = normalizePhone(phone);
    if (!p || !/^09\d{9}$/.test(p)) { setPhoneWarn(''); return; }
    const exists = await window.api.phoneExists(p);
    setPhoneWarn(exists ? STR.validation.phoneWarn : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validatePatient(name, normalizePhone(phone));
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    const r = await window.api.createPatient({
      full_name: name.trim(),
      phone: normalizePhone(phone),
      address: address.trim(),
    });
    setLoading(false);
    if (r.ok) {
      setNewPatient(r.patient as Patient);
      setSuccessOpen(true);
      toast.show('بیمار جدید با موفقیت ثبت شد.', 'success');
    } else {
      toast.show('خطا در ثبت بیمار.', 'error');
    }
  };

  const handlePrint = async () => {
    if (!newPatient) return;
    await window.api.printPatient({
      pharmacyName: settings.pharmacy_name,
      code: newPatient.subscription_code,
      name: newPatient.full_name,
      phone: newPatient.phone,
      address: newPatient.address,
      date: formatJalali(new Date()),
      paperSize: settings.paper_size as 'A5' | 'thermal80',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{STR.create.title}</h1>
        <p className="text-ink-muted mt-1">{STR.create.subtitle}</p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <Input
          ref={nameRef}
          label={STR.create.name}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={STR.create.namePlaceholder}
          error={errors.name}
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
        <div className="flex justify-end pt-3 border-t border-surface-border">
          <Button type="submit" loading={loading}>{STR.common.confirm}</Button>
        </div>
      </form>

      <SuccessDialog
        open={successOpen}
        patient={newPatient}
        onClose={() => { setSuccessOpen(false); reset(); }}
        onCreateNew={() => { setSuccessOpen(false); reset(); }}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default CreatePage;
