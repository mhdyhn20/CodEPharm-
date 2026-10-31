import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/Logo';
import { STR } from '@/constants/strings';
import { validateCreateAdmin, validateLogin } from '@/lib/validation';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/ui/Toast';

export const LoginPage: React.FC = () => {
  const { login, createAdmin, hasAnyUser, refreshHasAnyUser } = useApp();
  const toast = useToast();

  const [mode, setMode] = useState<'login' | 'createAdmin'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshHasAnyUser();
  }, [refreshHasAnyUser]);

  useEffect(() => {
    if (!hasAnyUser) setMode('createAdmin');
    else setMode('login');
  }, [hasAnyUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (mode === 'createAdmin') {
      const v = validateCreateAdmin(username, password, confirm);
      setErrors(v.errors);
      if (!v.valid) return;
      setLoading(true);
      const ok = await createAdmin(username.trim(), password);
      setLoading(false);
      if (ok) {
        toast.show('حساب کاربری مدیر ساخته شد. خوش آمدید!', 'success');
        await login(username.trim(), password);
      } else {
        toast.show('ساخت حساب ناموفق بود. شاید نام کاربری تکراری باشد.', 'error');
      }
    } else {
      const v = validateLogin(username, password);
      setErrors(v.errors);
      if (!v.valid) return;
      setLoading(true);
      const ok = await login(username.trim(), password);
      setLoading(false);
      if (!ok) {
        setErrors({ password: STR.auth.invalidLogin });
      }
    }
  };

  const isFirstRun = mode === 'createAdmin';

  return (
    <div className="min-h-screen w-full flex login-pattern">
      {/* Decorative side */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-success/20 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/20 mb-10">
            <Logo size={48} showText={false} />
            <div className="text-right">
              <div className="text-xl font-bold">{STR.appName}</div>
              <div className="text-xs text-white/80">{STR.tagline}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 max-w-md mx-auto text-right">
            <FeatureCard title="آفلاین" desc="بدون نیاز به اینترنت" />
            <FeatureCard title="سریع" desc="جستجوی فوری بیمار" />
            <FeatureCard title="امن" desc="داده‌های محلی" />
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-bg lg:rounded-r-3xl">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden justify-center mb-8">
            <Logo size={56} />
          </div>
          <div className="card shadow-float">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-ink">
                {isFirstRun ? STR.auth.createAdminTitle : STR.auth.loginTitle}
              </h1>
              {isFirstRun && (
                <p className="text-sm text-ink-muted mt-2">{STR.auth.createAdminSubtitle}</p>
              )}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <Input
                label={STR.auth.username}
                autoFocus
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={STR.auth.usernamePlaceholder}
                error={errors.username}
              />
              <Input
                label={STR.auth.password}
                type="password"
                autoComplete={isFirstRun ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={STR.auth.passwordPlaceholder}
                error={errors.password}
              />
              {isFirstRun && (
                <Input
                  label={STR.auth.confirmPassword}
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={STR.auth.passwordPlaceholder}
                  error={errors.confirmPassword}
                />
              )}
              <Button type="submit" loading={loading} className="w-full mt-2 py-3 text-base">
                {isFirstRun ? STR.auth.createAdmin : STR.auth.login}
              </Button>
            </form>
          </div>
          <div className="text-center text-xs text-ink-muted mt-5">
            {STR.appName} — نسخه ۱.۰.۰
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10">
    <div className="text-base font-bold mb-1">{title}</div>
    <div className="text-[11px] text-white/75 leading-5">{desc}</div>
  </div>
);

export default LoginPage;
