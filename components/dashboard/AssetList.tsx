'use client';

import type { PortfolioAsset } from './types';
import { formatCurrency } from '@/lib/utils';
import styles from '@/styles/components/dashboard/AssetList.module.scss';

function SkeletonRow() {
  return (
    <div className={styles.skelRow}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <div className={styles.skelCircle} />
        <div>
          <div className={`${styles.skelText} ${styles.short}`} />
          <div className={`${styles.skelText} ${styles.med}`} style={{ marginTop: 4 }} />
        </div>
      </div>
      <div className={styles.skelNum} />
      <div className={styles.skelNum} style={{ display: 'var(--skel-pnl, block)' }} />
    </div>
  );
}

interface Props {
  assets: PortfolioAsset[];
  isLoading: boolean;
}

export default function AssetList({ assets, isLoading }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>📋 资产持仓</h3>
        <span className={styles.viewAll}>查看全部</span>
      </div>

      {/* Column header */}
      <div className={styles.colHead}>
        <span>资产</span>
        <span>市值 / 数量</span>
        <span>涨跌幅</span>
      </div>

      {isLoading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : assets.length === 0 ? (
        <div className={styles.empty}>📂 暂无资产数据</div>
      ) : (
        assets.map((a) => {
          const up = a.change24hPercent >= 0;
          const down = a.change24hPercent < 0;
          return (
            <div key={a.symbol} className={styles.row}>
              <div className={styles.assetInfo}>
                <div className={styles.avatar}>{a.symbol[0]}</div>
                <div className={styles.nameGroup}>
                  <div className={styles.symbol}>{a.symbol}</div>
                  <div className={styles.assetName}>{a.name}</div>
                </div>
              </div>
              <div className={styles.values}>
                <div className={styles.amount}>{formatCurrency(a.valueUSD)}</div>
                <div className={styles.usd}>
                  {a.amount.toLocaleString()} {a.symbol}
                </div>
              </div>
              <div
                className={`${styles.change} ${up ? styles.up : ''} ${down ? styles.down : ''}`}
              >
                {up ? '+' : ''}{a.change24hPercent.toFixed(2)}%
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
