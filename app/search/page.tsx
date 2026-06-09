import type { Metadata } from 'next';
import SearchPageClient from './SearchPageClient';
import PageGuard from '@/components/auth/PageGuard';

export const metadata: Metadata = {
  title: '搜索',
};

export default function SearchPage() {
  return (
    <PageGuard>
      <div className="container section">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>搜索</h1>
        <SearchPageClient />
      </div>
    </PageGuard>
  );
}
