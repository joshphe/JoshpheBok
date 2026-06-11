'use client';

import type { TrendingCoin } from '@/lib/market-data';
import styles from '@/styles/components/TrendingCoins.module.scss';

function fmtBtcPrice(btc: number | null): string {
  if (btc == null) return '—';
  if (btc < 1e-6) return btc.toExponential(2);
  return btc.toFixed(8);
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
            {fmtBtcPrice(coin.priceBtc)} BTC
          </span>
        </div>
      ))}
    </div>
  );
}
