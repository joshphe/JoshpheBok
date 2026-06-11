'use client';

import type { PortfolioSummary } from './types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import styles from '@/styles/components/dashboard/OverviewCards.module.scss';

function OverviewCard({
  icon,
  label,
  value,
  subtext,
  valueClass,
  subClass,
}: {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  valueClass?: string;
  subClass?: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.icon}>{icon}</span>
      </div>
      <span className={`${styles.value} ${valueClass ?? ''}`}>{value}</span>
      {subtext && (
        <span className={`${styles.subtext} ${subClass ?? ''}`}>{subtext}</span>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skelLabel} />
      <div className={styles.skelValue} />
      <div className={styles.skelSub} />
    </div>
  );
}

interface Props {
  summary: PortfolioSummary | null;
  isLoading: boolean;
}

export default function OverviewCards({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <div className={styles.grid}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const { totalValueUSD, pnl24h, pnl24hPercent, unrealizedPnl, totalCostBasis, pnl7d, pnl7dPercent } = summary;

  const pnlPositive = pnl24h >= 0;
  const unrealizedPositive = unrealizedPnl >= 0;
  const weekPositive = (pnl7d ?? 0) >= 0;

  return (
    <div className={styles.grid}>
      <OverviewCard
        icon="👛"
        label="总资产"
        value={formatCurrency(totalValueUSD)}
        subtext={`成本 ${formatCurrency(totalCostBasis)}`}
      />
      <OverviewCard
        icon={pnlPositive ? '📈' : '📉'}
        label="24h 盈亏"
        value={`${pnlPositive ? '+' : ''}${formatCurrency(pnl24h)}`}
        subtext={`${pnlPositive ? '+' : ''}${pnl24hPercent.toFixed(2)}%`}
        valueClass={pnlPositive ? styles.positive : styles.negative}
        subClass={pnlPositive ? styles.positive : styles.negative}
      />
      <OverviewCard
        icon="💰"
        label="未实现盈亏"
        value={`${unrealizedPositive ? '+' : ''}${formatCurrency(unrealizedPnl)}`}
        subtext={unrealizedPnl !== 0 ? `${unrealizedPositive ? '+' : ''}${((unrealizedPnl / totalCostBasis) * 100).toFixed(2)}%` : '0.00%'}
        valueClass={unrealizedPositive ? styles.positive : styles.negative}
        subClass={unrealizedPositive ? styles.positive : styles.negative}
      />
      <OverviewCard
        icon="📅"
        label="7日变化"
        value={pnl7d != null ? `${weekPositive ? '+' : ''}${formatCurrency(pnl7d)}` : '—'}
        subtext={pnl7dPercent != null ? `${weekPositive ? '+' : ''}${pnl7dPercent.toFixed(2)}%` : '暂无数据'}
        valueClass={weekPositive ? styles.positive : styles.negative}
        subClass={weekPositive ? styles.positive : styles.negative}
      />
    </div>
  );
}
