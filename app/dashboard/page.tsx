import type { Metadata } from 'next';
import { getDashboardData } from '@/lib/dashboard';
import DashboardView from '@/components/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '我的空投与 DeFi 项目参与记录和收益总览',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardView data={data} />;
}
