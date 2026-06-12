'use client';

import dynamic from 'next/dynamic';
import PageGuard from '@/components/auth/PageGuard';

const PortfolioPage = dynamic(
  () => import('@/components/portfolio/PortfolioPage'),
  { ssr: false },
);

export default function ArchivesPage() {
  return (
    <PageGuard>
      <PortfolioPage />
    </PageGuard>
  );
}
