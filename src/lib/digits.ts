// Persian/Arabic/East-Arabic digits <-> ASCII digits

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const s = String(input);
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      out += FA_DIGITS[code - 48];
    } else {
      out += ch;
    }
  }
  return out;
}

export function toEnglishDigits(input: string): string {
  let out = '';
  for (const ch of input) {
    const faIdx = FA_DIGITS.indexOf(ch);
    if (faIdx !== -1) { out += faIdx; continue; }
    const arIdx = AR_DIGITS.indexOf(ch);
    if (arIdx !== -1) { out += arIdx; continue; }
    out += ch;
  }
  return out;
}

/**
 * Returns a React onChange handler that keeps a text field's value in English digits
 * by converting Persian/Arabic digits on input. Usage:
 *   <Input onChange={numericInput(setPhone)} ... />
 */
export function numericInput(setter: (v: string) => void) {
  return (e: { target: { value: string } }) => {
    setter(toEnglishDigits(e.target.value));
  };
}
