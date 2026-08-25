import { redirect } from 'next/navigation';
import { clearAdminCookie } from '@/lib/admin-auth';
export async function GET() { await clearAdminCookie(); redirect(`/${process.env.ADMIN_PATH}/login`); }
