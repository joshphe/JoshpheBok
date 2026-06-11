'use client';

import styles from '@/styles/components/CryptoGlobals.module.scss';
import type { CryptoGlobalData } from '@/lib/market-data';

function fmtCompact(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString('en-US');
}

export default function CryptoGlobals({
  totalMarketCapUsd,
  btcDominance,
  ethDominance,
  totalVolumeUsd,
}: CryptoGlobalData) {
  return (
    <div className={styles.metrics}>
      <div className={styles.metric}>
        <span className={styles.metricValue}>{fmtCompact(totalMarketCapUsd)}</span>
        <span className={styles.metricLabel}>总市值</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricValue}>{btcDominance.toFixed(1)}%</span>
        <span className={styles.metricLabel}>BTC 市占率</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricValue}>{ethDominance.toFixed(1)}%</span>
        <span className={styles.metricLabel}>ETH 市占率</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricValue}>{fmtCompact(totalVolumeUsd)}</span>
        <span className={styles.metricLabel}>24h 交易量</span>
      </div>
    </div>
  );
}
