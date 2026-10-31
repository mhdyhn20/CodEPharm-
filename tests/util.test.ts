import { describe, it, expect } from 'vitest';
import { toPersianDigits, toEnglishDigits } from '../src/lib/digits';
import { normalizePersian } from '../src/lib/normalize';
import { normalizePhone, validatePatient } from '../src/lib/validation';
import { formatJalali } from '../src/lib/jalali';

describe('digits', () => {
  it('converts English digits to Persian', () => {
    expect(toPersianDigits(101)).toBe('۱۰۱');
    expect(toPersianDigits('09123456789')).toBe('۰۹۱۲۳۴۵۶۷۸۹');
  });
  it('converts Persian/Arabic digits to English', () => {
    expect(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
    expect(toEnglishDigits('٠٩١٢٣٤٥٦٧٨٩')).toBe('09123456789');
  });
  it('round trips', () => {
    expect(toEnglishDigits(toPersianDigits('12345'))).toBe('12345');
  });
});

describe('normalizePersian', () => {
  it('replaces Arabic ي ك with Persian ی ک', () => {
    expect(normalizePersian('كتاب يادگيري')).toBe('کتاب یادگیری');
  });
  it('trims and collapses whitespace', () => {
    expect(normalizePersian('  مهدی   حنیفه  ')).toBe('مهدی حنیفه');
  });
});

describe('validation', () => {
  it('validates name minimum length (>=3 chars)', () => {
    expect(validatePatient('عل', '09123456789').valid).toBe(false);
    expect(validatePatient('علی', '09123456789').valid).toBe(true); // 3 chars (Aegean numeral shape in Persian)
    expect(validatePatient('مهدی حنیفه', '09123456789').valid).toBe(true);
  });
  it('validates Iranian mobile format (09xxxxxxxxx)', () => {
    const v = validatePatient('مهدی حنیفه', '0912');
    expect(v.valid).toBe(false);
    expect(v.errors.phone).toBeTruthy();
  });
  it('normalizes phone digits', () => {
    expect(normalizePhone('۰۹۱۲-۳۴۵ ۶۷۸۹')).toBe('09123456789');
  });
});

describe('jalali', () => {
  it('converts a known Gregorian date (March 20 2024 = 1 Farvardin 1403)', () => {
    // Use Tehran local date (UTC+3:30); equinox was Mar 20 2024 ~07:36 IRST => Mar 20 = 1 Farvardin 1403
    const s = formatJalali(new Date('2024-03-20T00:00:00+03:30'));
    expect(s.startsWith('1403/01/')).toBe(true);
  });
  it('always returns YYYY/MM/DD (English digits) with slashes', () => {
    const s = formatJalali(new Date());
    expect(s).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });
});
