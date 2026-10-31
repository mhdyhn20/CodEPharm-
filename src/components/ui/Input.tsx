import React, { forwardRef, useState } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  wrapperClass?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, icon, wrapperClass = '', className = '', type = 'text', ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const realType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className={`block ${wrapperClass}`}>
      {label && <span className="label-base">{label}</span>}
      <span className="relative block">
        {icon && (
          <span className="absolute inset-y-0 right-4 flex items-center text-ink-faint pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={realType}
          className={`input-base ${icon ? 'pr-11' : ''} ${error ? 'border-danger focus:border-danger' : ''} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            tabIndex={-1}
            className="absolute inset-y-0 left-3 flex items-center text-ink-muted hover:text-brand transition-colors px-2"
            aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </span>
      {error && <span className="block mt-1.5 text-xs text-danger">{error}</span>}
      {!error && hint && <span className="block mt-1.5 text-xs text-ink-muted">{hint}</span>}
    </label>
  );
});

export default Input;
