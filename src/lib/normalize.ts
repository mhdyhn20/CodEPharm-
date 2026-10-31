// Normalize Persian text for robust searching:
// - Replace Arabic ي/ك with Persian ی/ک
// - Remove accents (tatwil, tashdid, etc.) — we keep it simple
// - Collapse whitespace
// - Lowercase for any Latin chars

export function normalizePersian(text: string): string {
  if (!text) return '';
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ـ\u064B-\u065F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
