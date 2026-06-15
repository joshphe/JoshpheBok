import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';
import PageGuard from '@/components/auth/PageGuard';
import PortfolioPage from '@/components/portfolio/PortfolioPage';

export const metadata: Metadata = {
  title: '资产组合管理',
  description: '美股与虚拟货币持仓管理，实时市价盈亏计算',
  openGraph: {
    title: `资产组合管理 | ${SITE.title}`,
    description: '美股与虚拟货币持仓管理，实时市价盈亏计算',
  },
};

export default function PortfolioRoute() {
  return (
    <PageGuard>
      <PortfolioPage />
    </PageGuard>
  );
}
