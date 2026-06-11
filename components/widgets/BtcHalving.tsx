'use client';

import { useMemo } from 'react';
import styles from '@/styles/components/BtcHalving.module.scss';
import type { HalvingData } from '@/lib/market-data';

const RING_CIRCUMFERENCE = 2 * Math.PI * 31; // r=31 on 72×72 viewBox

export default function BtcHalving({
  blocksRemaining,
  estimatedDate,
  progressPercent,
}: HalvingData) {
  const offset = useMemo(
    () => RING_CIRCUMFERENCE * (1 - Math.min(progressPercent, 100) / 100),
    [progressPercent],
  );

  const fmtBlocks = useMemo(() => {
    if (blocksRemaining >= 1000) {
      return (blocksRemaining / 1000).toFixed(1) + 'k';
    }
    return blocksRemaining.toLocaleString();
  }, [blocksRemaining]);

  return (
    <div className={styles.halvingWrap}>
      <div className={styles.ringContainer}>
        <svg
          className={styles.ringSvg}
          viewBox="0 0 72 72"
          aria-hidden="true"
        >
          <circle
            className={styles.ringBg}
            cx="36"
            cy="36"
            r="31"
          />
          <circle
            className={styles.ringFill}
            cx="36"
            cy="36"
            r="31"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.ringCenter}>
          <span className={styles.ringNumber}>{fmtBlocks}</span>
          <span className={styles.ringUnit}>剩余区块</span>
        </div>
      </div>

      <p className={styles.info}>
        预计 <strong>{estimatedDate}</strong>
      </p>
    </div>
  );
}
