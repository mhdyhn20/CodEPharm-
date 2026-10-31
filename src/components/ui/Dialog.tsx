import React, { useEffect, useRef } from 'react';
import Logo from '../Logo';
import { STR } from '@/constants/strings';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  hideHeader?: boolean;
  closeOnEsc?: boolean;
}

export const Dialog: React.FC<Props> = ({
  open,
  onClose,
  title,
  children,
  width = 440,
  hideHeader = false,
  closeOnEsc = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Focus first focusable element
    const el = dialogRef.current?.querySelector<HTMLElement>('button, input, textarea, [tabindex]:not([tabindex="-1"])');
    el?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, closeOnEsc]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-float w-full max-h-[90vh] overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]"
        style={{ maxWidth: width }}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <Logo size={36} showText={false} />
              <div>
                <div className="text-base font-bold text-ink">{title || STR.appName}</div>
                <div className="text-[11px] text-ink-muted">{STR.appName}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label={STR.common.close}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface-muted transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
