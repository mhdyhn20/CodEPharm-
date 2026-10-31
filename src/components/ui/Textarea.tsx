import React, { forwardRef } from 'react';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { label, error, className = '', ...rest },
  ref
) {
  return (
    <label className="block">
      {label && <span className="label-base">{label}</span>}
      <textarea
        ref={ref}
        className={`input-base min-h-[96px] resize-y py-3 ${error ? 'border-danger focus:border-danger' : ''} ${className}`}
        {...rest}
      />
      {error && <span className="block mt-1.5 text-xs text-danger">{error}</span>}
    </label>
  );
});

export default Textarea;
