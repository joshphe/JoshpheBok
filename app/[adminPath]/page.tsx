import { notFound, redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getDashboardData } from '@/lib/dashboard';
import AdminView from '@/components/dashboard/AdminView';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (!process.env.ADMIN_PATH || adminPath !== process.env.ADMIN_PATH) notFound();
  if (!(await isAdminAuthenticated())) redirect(`/${adminPath}/login`);
  return <AdminView initialData={await getDashboardData()} />;
}
