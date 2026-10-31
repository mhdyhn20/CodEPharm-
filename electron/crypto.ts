import { randomBytes, createHmac, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const s = salt ?? randomBytes(16).toString('hex');
  const h = createHmac('sha256', s).update(password).digest('hex');
  return { salt: s, hash: h };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const { hash: candidate } = hashPassword(password, salt);
  const a = Buffer.from(candidate);
  const b = Buffer.from(hash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
