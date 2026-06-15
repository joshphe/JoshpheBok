'use client';

import { useState, useCallback } from 'react';
import { usePolling } from '@/hooks/usePolling';
import type { MarketData } from '@/lib/market-data';
import { fetchAllMarketData } from '@/lib/market-data';
import MarketCard from './MarketCard';
import FinanceTicker from './FinanceTicker';
import Web3Dashboard from './Web3Dashboard';
import TrendingTicker from './TrendingTicker';
import styles from '@/styles/components/WealthSection.module.scss';

export default function WealthSection() {
  const [data, setData] = useState<MarketData | null>(null);

  const load = useCallback(async (_signal: AbortSignal) => {
    const result = await fetchAllMarketData();
    setData(result);
  }, []);

  usePolling(load);

  const aShares = data?.aShares ?? [];
  const usStocks = data?.usStocks ?? [];
  const crypto = data?.crypto ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.outerCard}>
        <div className={styles.tickerWrap}>
          <FinanceTicker />
        </div>
        <div className={styles.dashboard}>
          <MarketCard
            title="A股市场"
            subtitle="上证 · 沪深 · 创业板"
            items={aShares}
          />
          <MarketCard
            title="美股市场"
            subtitle="道琼斯 · 纳斯达克 · 标普500"
            items={usStocks}
          />
          <MarketCard
            title="加密货币"
            subtitle="BTC · ETH · BNB"
            items={crypto}
            isCrypto
          />

          <Web3Dashboard />
        </div>
        <div className={styles.trendingWrap}>
          <TrendingTicker />
        </div>
      </div>
    </section>
  );
}
