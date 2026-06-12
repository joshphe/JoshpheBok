'use client';

import type { PortfolioSummary as Summary } from './types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

interface Props {
  summary: Summary | null;
  isLoading: boolean;
}

export default function PortfolioSummary({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <div className={styles.summaryGrid}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${styles.summaryCard} ${styles.skeleton}`}>
            <div className={styles.skelLine} />
            <div className={`${styles.skelLine} ${styles.skelShort}`} />
          </div>
        ))}
      </div>
    );
  }

  const isPositive = summary.totalPnl >= 0;

  return (
    <div className={styles.summaryGrid}>
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>总资产</span>
        <span className={styles.summaryValue}>
          {formatCurrency(summary.totalValue)}
        </span>
      </div>

      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>总盈亏</span>
        <span className={`${styles.summaryValue} ${isPositive ? styles.up : styles.down}`}>
          {isPositive ? '+' : ''}{formatCurrency(summary.totalPnl)}
          <span className={styles.summaryPercent}>
            ({formatPercent(summary.totalPnlPercent)})
          </span>
        </span>
      </div>

      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>持仓数量</span>
        <span className={styles.summaryValue}>{summary.holdingCount} 个</span>
      </div>
    </div>
  );
}
