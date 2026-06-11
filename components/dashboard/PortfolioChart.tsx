'use client';

import type { PortfolioAsset } from './types';
import styles from '@/styles/components/dashboard/PortfolioChart.module.scss';

// Asset color palette (matching MyBok's biophilic theme)
const COLORS = [
  'var(--color-primary)',
  'var(--color-primary-light)',
  'var(--color-accent)',
  'var(--color-accent-warm)',
  'var(--color-moss)',
  'var(--color-leaf)',
  'var(--color-bark)',
];

interface Props {
  assets: PortfolioAsset[];
  isLoading: boolean;
}

export default function PortfolioChart({ assets, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>📊 资产分配</h3>
        <div className={styles.chartArea}>
          <div className={styles.skelDonut} />
          <div className={styles.skelLegend}>
            <div className={styles.skelDot} />
            <div className={styles.skelDot} />
            <div className={styles.skelDot} />
          </div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>📊 资产分配</h3>
        <div className={styles.placeholder}>添加资产以查看分配图表</div>
      </div>
    );
  }

  // Build conic-gradient segments
  const total = assets.reduce((sum, a) => sum + a.allocationPercent, 0);
  const segments: string[] = [];
  let cumulative = 0;

  for (let i = 0; i < assets.length; i++) {
    const pct = assets[i].allocationPercent;
    if (pct <= 0) continue;
    const color = COLORS[i % COLORS.length];
    segments.push(`${color} ${cumulative}% ${cumulative + pct}%`);
    cumulative += pct;
  }

  // If total < 100 (rounding), fill remaining with border color
  if (cumulative < 100) {
    segments.push(`var(--color-border) ${cumulative}% 100%`);
  }

  const gradient = segments.length > 0
    ? `conic-gradient(${segments.join(', ')})`
    : 'var(--color-border)';

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>📊 资产分配</h3>
      <div className={styles.chartArea}>
        <div className={styles.donut} style={{ background: gradient }}>
          <div className={styles.hole}>
            <div className={styles.holeText}>
              {assets.length}
              <div className={styles.holeSub}>项资产</div>
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          {assets.map((a, i) => (
            <div key={a.symbol} className={styles.legendItem}>
              <span
                className={styles.dot}
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {a.symbol} {a.allocationPercent.toFixed(1)}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
