'use server';

import { timingSafeEqual } from 'crypto';
import { redirect } from 'next/navigation';
import { setAdminCookie } from '@/lib/admin-auth';

export async function login(_: { error: string }, formData: FormData) {
  const supplied = String(formData.get('password') || '');
  const expected = process.env.ADMIN_PASSWORD || '';
  const valid = supplied.length === expected.length && expected.length > 0
    && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return { error: '密码不正确，请重试。' };
  await setAdminCookie();
  redirect(`/${process.env.ADMIN_PATH}`);
}
