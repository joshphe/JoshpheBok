'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchAllWeb3Data,
  type FearGreedData,
  type CryptoGlobalData,
  type HalvingData,
  type TrendingCoin,
} from '@/lib/market-data';
import FearGreedIndex from './FearGreedIndex';
import CryptoGlobals from './CryptoGlobals';
import BtcHalving from './BtcHalving';
import TrendingCoins from './TrendingCoins';
import styles from '@/styles/components/Web3Dashboard.module.scss';

export interface Web3State {
  fearGreed: FearGreedData | null;
  cryptoGlobal: CryptoGlobalData | null;
  halving: HalvingData | null;
  trending: TrendingCoin[];
}

const POLL_INTERVAL = 5 * 60 * 1000;

/**
 * A standalone card shell used both inside Web3Dashboard and by the parent grid.
 * Renders a header + body, with loading placeholder when data is missing.
 */
function DashboardCard({
  icon,
  title,
  ready,
  children,
  className,
}: {
  icon: string;
  title: string;
  ready: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <h4 className={styles.cardHeader}>
        <span aria-hidden="true">{icon}</span> {title}
      </h4>
      <div className={styles.cardBody}>
        {ready ? children : <p className={styles.placeholder}>数据加载中...</p>}
      </div>
    </div>
  );
}

/**
 * Fetches Web3 data and renders 4 inline cards (no wrapping grid).
 * The parent grid controls column layout.
 */
export default function Web3Dashboard() {
  const [data, setData] = useState<Web3State>({
    fearGreed: null,
    cryptoGlobal: null,
    halving: null,
    trending: [],
  });
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchAllWeb3Data();
    setData({
      fearGreed: result.fearGreed,
      cryptoGlobal: result.cryptoGlobal,
      halving: result.halving,
      trending: result.trending,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await load();
    };

    tick();
    const interval = setInterval(tick, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  if (!mounted) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardHeader}>加载中...</div>
            <div className={styles.cardBody}>
              <p className={styles.placeholder}>数据加载中...</p>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      <DashboardCard icon="🧠" title="恐慌贪婪指数" ready={!!data.fearGreed}>
        {data.fearGreed && (
          <FearGreedIndex
            value={data.fearGreed.value}
            classification={data.fearGreed.classification}
          />
        )}
      </DashboardCard>

      <DashboardCard icon="🌍" title="加密市场概览" ready={!!data.cryptoGlobal}>
        {data.cryptoGlobal && <CryptoGlobals {...data.cryptoGlobal} />}
      </DashboardCard>

      <DashboardCard icon="⛏️" title="BTC 减半倒计时" ready={!!data.halving}>
        {data.halving && <BtcHalving {...data.halving} />}
      </DashboardCard>

      <DashboardCard
        icon="🔥"
        title="热门趋势"
        ready={data.trending.length > 0}
        className={styles.span3}
      >
        {data.trending.length > 0 && <TrendingCoins coins={data.trending} />}
      </DashboardCard>
    </>
  );
}
