'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { fetchTrendingCoins } from '@/lib/market-data';
import type { TrendingCoin } from '@/lib/market-data';
import styles from '@/styles/components/TrendingTicker.module.scss';

function fmtUsd(value: number): string {
  if (value >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  if (value >= 0.0001) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(8)}`;
}

export default function TrendingTicker() {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);

  const load = useCallback(async (_signal: AbortSignal) => {
    const result = await fetchTrendingCoins();
    if (result.length > 0) setCoins(result);
  }, []);

  usePolling(load);

  // Duplicate for seamless loop
  const doubled = [...coins, ...coins];

  return (
    <div className={styles.strip}>
      <span className={styles.label}>热门代币</span>
      <div className={styles.track}>
        <div className={`${styles.run} ${doubled.length === 0 ? styles.paused : ''}`}>
          {doubled.length > 0 ? (
            doubled.map((coin, i) => (
              <span key={`${coin.id}-${i}`} className={styles.item}>
                {coin.thumb ? (
                  <img
                    src={coin.thumb}
                    alt=""
                    className={styles.icon}
                    loading="lazy"
                    width={16}
                    height={16}
                  />
                ) : (
                  <span className={styles.icon} />
                )}
                <span className={styles.symbol}>{coin.symbol}</span>
                <span className={styles.name}>{coin.name}</span>
                <span className={styles.price}>
                  {coin.priceUsd != null ? fmtUsd(coin.priceUsd) : '—'}
                </span>
              </span>
            ))
          ) : (
            <span className={styles.placeholder}>加载中...</span>
          )}
        </div>
      </div>
    </div>
  );
}
