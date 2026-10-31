// Jalali (Persian / Shamsi) date conversion.
// Algorithm adapted from jalaali-js (MIT License).

interface JDate { jy: number; jm: number; jd: number; }

function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

// Jalaali leap year cycle breaks
const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
  2192, 2262, 2324, 2394, 2456, 3178,
];

function jalaliCal(jy: number) {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm: number;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div((n % 33) + 3, 4);
  if (jump !== undefined && jump % 33 === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div(div(gy, 100) + 1, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump !== undefined && jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let a21: number;
  if ((n - jump === 0 && jump % 33 === 4) || n % 33 === 4 && n % 33 === 0) {
    a21 = 0;
  } else if (n % 33 < 6) {
    a21 = 1;
  } else {
    a21 = 0;
  }
  return { leap: a21 === 1, gy, march };
}

function g2d(gy: number, gm: number, gd: number): number {
  const a = div(gm - 14, 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  return gd + div(153 * m + 2, 5) + 365 * y + div(y, 4) - div(y, 100) + div(y, 400) - 32045;
}

function d2g(jdn: number) {
  const j = Math.floor(jdn) + 32044;
  const g = div(4 * j + 3, 146097);
  const dg = j - div(146097 * g, 4);
  const c = div(4 * dg + 3, 1461);
  const dc = dg - div(1461 * c, 4);
  const b = div(5 * dc + 2, 153);
  const gd = dc - div(153 * b + 2, 5) + 1;
  const gm = b + 3 - 12 * div(b, 10);
  const gy = 100 * g + c - 4800 + div(b, 10);
  return { gy, gm, gd };
}

function d2j(jdn: number): JDate {
  const { gy } = d2g(jdn);
  let jy = gy - 621;
  const cal = jalaliCal(jy);
  const jdn1f = g2d(gy, 3, cal.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      return { jy, jm: 1 + div(k, 31), jd: (k % 31) + 1 };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (cal.leap) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: (k % 30) + 1 };
}

function j2d(jy: number, jm: number, jd: number): number {
  const cal = jalaliCal(jy);
  return g2d(jy + 621, 3, cal.march) + (jm <= 7 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) + jd - 1;
}
// silence unused-var lint when export is removed in strict TS
void d2g;

export function toJalali(date: Date): { year: number; month: number; day: number } {
  const jdn = g2d(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const j = d2j(jdn);
  return { year: j.jy, month: j.jm, day: j.jd };
}

export function formatJalali(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const j = toJalali(d);
  const mm = String(j.month).padStart(2, '0');
  const dd = String(j.day).padStart(2, '0');
  return `${j.year}/${mm}/${dd}`;
}

// Exposed for tests
export { j2d, g2d };
