'use client';

import { useEffect, useState } from 'react';
import type { MarketData } from '@/lib/market-data';
import { fetchAllMarketData } from '@/lib/market-data';
import MarketCard from './MarketCard';
import styles from '@/styles/components/WealthSection.module.scss';

export default function WealthSection() {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await fetchAllMarketData();
      if (!cancelled) setData(result);
    }

    load();

    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const aShares = data?.aShares ?? [];
  const usStocks = data?.usStocks ?? [];
  const crypto = data?.crypto ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* ── Top half: 3 market cards ── */}
        <div className={styles.top}>
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
        </div>

        {/* ── Bottom half: placeholder ── */}
        <div className={styles.bottom}>
          <p className={styles.comingSoon}>敬请期待</p>
        </div>
      </div>
    </section>
  );
}
