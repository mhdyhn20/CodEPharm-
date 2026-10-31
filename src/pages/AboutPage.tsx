import React from 'react';
import Logo from '@/components/Logo';
import { STR } from '@/constants/strings';
import { toPersianDigits } from '@/lib/digits';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink">{STR.about.title}</h1>
      </header>

      <div className="card flex flex-col items-center text-center py-10">
        <Logo size={80} />
        <h2 className="mt-4 text-xl font-bold text-ink">{STR.appName}</h2>
        <p className="text-sm text-ink-muted mt-1">{STR.tagline}</p>

        <div className="w-full mt-8 bg-surface-muted rounded-2xl p-5 text-right leading-8 text-ink-soft">
          {STR.about.text}
        </div>

        <div className="mt-6 text-xs text-ink-muted flex gap-4">
          <span>{STR.about.version} {toPersianDigits('1.0.0')}</span>
          <span>© {toPersianDigits(new Date().getFullYear())} {STR.appName}</span>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
