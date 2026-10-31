import { toEnglishDigits } from './digits';

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<'name' | 'phone' | 'address' | 'username' | 'password' | 'confirmPassword', string>>;
}

export function validatePatient(name: string, phone: string): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const n = name.trim();
  if (!n) errors.name = 'لطفاً نام بیمار را وارد کنید.';
  else if (n.length < 3) errors.name = 'نام باید حداقل ۳ کاراکتر باشد.';

  const p = toEnglishDigits(phone.trim());
  if (!p) {
    errors.phone = 'شماره موبایل الزامی است.';
  } else if (!/^09\d{9}$/.test(p)) {
    errors.phone = 'شماره موبایل باید با 09 شروع و ۱۱ رقم باشد.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(username: string, password: string): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  if (!username.trim()) errors.username = 'نام کاربری الزامی است.';
  if (password.length < 6) errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCreateAdmin(username: string, password: string, confirm: string): ValidationResult {
  const base = validateLogin(username, password);
  if (password !== confirm) {
    base.errors.confirmPassword = 'تکرار رمز عبور با رمز عبور همخوانی ندارد.';
  }
  base.valid = Object.keys(base.errors).length === 0;
  return base;
}

// Normalize phone: convert all digit sets to English, strip spaces/dashes, ensure string
export function normalizePhone(input: string): string {
  return toEnglishDigits(input.replace(/[\s\-()]/g, '').trim());
}
