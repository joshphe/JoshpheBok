'use client';

import { useState, useCallback, useRef } from 'react';
import { usePolling } from '@/hooks/usePolling';
import {
  fetchAllWeb3Data,
  type FearGreedData,
  type CryptoGlobalData,
  type HalvingData,
} from '@/lib/market-data';
import FearGreedIndex from './FearGreedIndex';
import CryptoGlobals from './CryptoGlobals';
import BtcHalving from './BtcHalving';
import styles from '@/styles/components/Web3Dashboard.module.scss';

export interface Web3State {
  fearGreed: FearGreedData | null;
  cryptoGlobal: CryptoGlobalData | null;
  halving: HalvingData | null;
}

/**
 * A standalone card shell used both inside Web3Dashboard and by the parent grid.
 * Renders a header + body, with loading placeholder when data is missing.
 */
function DashboardCard({
  title,
  ready,
  children,
  className,
}: {
  title: string;
  ready: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <h4 className={styles.cardHeader}>{title}</h4>
      <div className={styles.cardBody}>
        {ready ? children : <p className={styles.placeholder}>数据加载中...</p>}
      </div>
    </div>
  );
}

/**
 * Fetches Web3 data and renders 3 inline cards (no wrapping grid).
 * The parent grid controls column layout.
 */
export default function Web3Dashboard() {
  const [data, setData] = useState<Web3State>({
    fearGreed: null,
    cryptoGlobal: null,
    halving: null,
  });
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  const load = useCallback(async (_signal: AbortSignal) => {
    const result = await fetchAllWeb3Data();
    setData({
      fearGreed: result.fearGreed,
      cryptoGlobal: result.cryptoGlobal,
      halving: result.halving,
    });
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []);

  usePolling(load);

  if (!mounted) {
    return (
      <>
        {[1, 2, 3].map((i) => (
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
      <DashboardCard title="恐慌贪婪指数" ready={!!data.fearGreed}>
        {data.fearGreed && (
          <FearGreedIndex
            value={data.fearGreed.value}
            classification={data.fearGreed.classification}
          />
        )}
      </DashboardCard>

      <DashboardCard title="加密市场概览" ready={!!data.cryptoGlobal}>
        {data.cryptoGlobal && <CryptoGlobals {...data.cryptoGlobal} />}
      </DashboardCard>

      <DashboardCard title="BTC 减半倒计时" ready={!!data.halving}>
        {data.halving && <BtcHalving {...data.halving} />}
      </DashboardCard>

    </>
  );
}
