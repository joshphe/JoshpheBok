import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'mybok_admin';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  if (!process.env.ADMIN_SESSION_SECRET) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return process.env.ADMIN_SESSION_SECRET;
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createAdminToken() {
  const payload = String(Math.floor(Date.now() / 1000));
  return `${payload}.${signature(payload)}`;
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [payload, supplied] = token.split('.');
  if (!payload || !supplied || !/^\d+$/.test(payload)) return false;
  const expected = signature(payload);
  if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return false;
  return Math.floor(Date.now() / 1000) - Number(payload) < MAX_AGE;
}

export async function setAdminCookie() {
  (await cookies()).set(COOKIE_NAME, createAdminToken(), {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE_NAME);
}
