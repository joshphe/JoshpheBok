'use client';

import dynamic from 'next/dynamic';
import PageGuard from '@/components/auth/PageGuard';

const AssetDashboard = dynamic(
  () => import('@/components/dashboard/AssetDashboard'),
  { ssr: false },
);

export default function ArchivesPage() {
  return (
    <PageGuard>
      <AssetDashboard />
    </PageGuard>
  );
}
