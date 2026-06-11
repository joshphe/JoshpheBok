'use client';

import { useMemo } from 'react';
import type { GasData } from '@/lib/market-data';
import styles from '@/styles/components/GasTracker.module.scss';

const GWEI = 1e9;

// Normalize gas price range for bar visualization
const MAX_GAS = 200; // gwei cap for bar

function barPercent(gwei: number): number {
  return Math.min((gwei / MAX_GAS) * 100, 100);
}

function fmtEth(usd: number): string {
  return '$' + usd.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GasTracker({ ethPrice, low, average, high }: GasData) {
  const hasGas = low != null && average != null && high != null;

  const bars = useMemo(() => {
    if (!hasGas) return null;
    return [
      { label: 'Low', value: low!, pct: barPercent(low!) },
      { label: 'Avg', value: average!, pct: barPercent(average!) },
      { label: 'High', value: high!, pct: barPercent(high!) },
    ];
  }, [hasGas, low, average, high]);

  return (
    <div className={styles.gasWrap}>
      {/* ETH Price */}
      {ethPrice > 0 && (
        <div className={styles.ethPrice}>
          <span className={styles.ethSymbol}>ETH</span>
          <span className={styles.ethValue}>{fmtEth(ethPrice)}</span>
        </div>
      )}

      {/* Gas bars */}
      {bars ? (
        <div className={styles.gasRows}>
          {bars.map((b, i) => (
            <div key={i} className={styles.gasRow}>
              <span className={styles.gasLabel}>{b.label}</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${styles[b.label.toLowerCase() as 'low' | 'average' | 'high']}`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className={styles.gasValue}>{b.value} Gwei</span>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noGas}>
          {ethPrice > 0
            ? 'Gas 数据暂无'
            : '链上数据加载中...'}
        </p>
      )}
    </div>
  );
}
