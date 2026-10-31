import React from 'react';
import { toPersianDigits } from '@/lib/digits';
import { STR } from '@/constants/strings';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<Props> = ({ page, totalPages, total, perPage, onChange }) => {
  if (totalPages <= 1) return null;

  const pages: (number | 'dots')[] = [];
  const add = (p: number | 'dots') => pages.push(p);
  const windowSize = 1;

  add(1);
  if (page - windowSize > 2) add('dots');
  for (let p = Math.max(2, page - windowSize); p <= Math.min(totalPages - 1, page + windowSize); p++) add(p);
  if (page + windowSize < totalPages - 1) add('dots');
  if (totalPages > 1) add(totalPages);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
      <div className="text-sm text-ink-muted">
        نمایش {toPersianDigits(start)} تا {toPersianDigits(end)} از {toPersianDigits(total)} مورد
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-surface-border text-ink-soft hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {STR.common.prev}
        </button>
        {pages.map((p, i) =>
          p === 'dots' ? (
            <span key={`d${i}`} className="px-2 text-ink-faint">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`min-w-[36px] h-9 px-2.5 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-brand text-white shadow-sm'
                  : 'border border-surface-border text-ink-soft hover:bg-brand-50 hover:text-brand'
              }`}
            >
              {toPersianDigits(p)}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {STR.common.next}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
