'use client';

import type { TrendingCoin } from '@/lib/market-data';
import styles from '@/styles/components/TrendingCoins.module.scss';

function fmtUsd(value: number): string {
  if (value >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(8)}`;
}

export default function TrendingCoins({ coins }: { coins: TrendingCoin[] }) {
  return (
    <div className={styles.list}>
      {coins.map((coin) => (
        <div key={coin.id} className={styles.row}>
          <span className={styles.rank}>
            {coin.marketCapRank != null ? `#${coin.marketCapRank}` : '—'}
          </span>
          {coin.thumb ? (
            <img
              src={coin.thumb}
              alt=""
              className={styles.icon}
              loading="lazy"
              width={22}
              height={22}
            />
          ) : (
            <div className={styles.icon} />
          )}
          <div className={styles.info}>
            <span className={styles.symbol}>{coin.symbol}</span>
            <span className={styles.name}>{coin.name}</span>
          </div>
          <span className={styles.price}>
            {coin.priceUsd != null ? fmtUsd(coin.priceUsd) : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}
