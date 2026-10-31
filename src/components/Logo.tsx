import React from 'react';

interface Props {
  size?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
  textClassName?: string;
}

// Custom CodEPharm logo mark — pill + Rx cross + "C" monogram in brand teal
export const Logo: React.FC<Props> = ({ size = 40, showText = true, variant = 'dark', textClassName = '' }) => {
  const titleColor = variant === 'light' ? 'text-white' : 'text-ink';
  const subtitleColor = variant === 'light' ? 'text-white/70' : 'text-ink-muted';
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0E6E73" />
            <stop offset="100%" stopColor="#084A4D" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#lg1)" />
        {/* Stylized C + pill cross */}
        <path
          d="M20 22c0-6.627 5.373-12 12-12 4.5 0 8.4 2.48 10.4 6.12l-5.26 2.88A6 6 0 1 0 32 42a6 6 0 0 0 5.14-2.88l5.26 2.88C40.4 45.52 36.5 48 32 48c-6.627 0-12-5.373-12-12V22z"
          fill="#fff"
        />
        <rect x="44" y="16" width="4" height="14" rx="2" fill="#2FBFA3" />
        <rect x="39" y="21" width="14" height="4" rx="2" fill="#2FBFA3" />
      </svg>
      {showText && (
        <div className={`leading-tight ${textClassName}`}>
          <div className={`text-base font-bold ${titleColor}`}>کد ای فارم</div>
          <div className={`text-[11px] font-medium ${subtitleColor}`}>CodEPharm</div>
        </div>
      )}
    </div>
  );
};

export default Logo;
