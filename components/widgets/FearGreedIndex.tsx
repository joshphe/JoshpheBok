'use client';

import { useMemo } from 'react';
import styles from '@/styles/components/FearGreedIndex.module.scss';

interface Props {
  value: number;
  classification: string;
}

function sentimentClass(val: number): string {
  if (val <= 20) return styles.extremeFear;
  if (val <= 40) return styles.fear;
  if (val <= 60) return styles.neutral;
  if (val <= 80) return styles.greed;
  return styles.extremeGreed;
}

export default function FearGreedIndex({ value, classification }: Props) {
  // Gauge: value represents position from left (0 = full fear, 100 = full greed)
  // The track covers from the right edge inward, so transform: scaleX(1 - value/100)
  const scaleX = useMemo(() => 1 - value / 100, [value]);

  return (
    <div className={styles.fgWrapper}>
      <span className={`${styles.value} ${sentimentClass(value)}`}>
        {value}
      </span>
      <span className={styles.label}>{classification}</span>

      <div className={styles.gauge}>
        <div
          className={styles.gaugeTrack}
          style={{ transform: `scaleX(${scaleX})` }}
        />
      </div>

      <div className={styles.gaugeLabels}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
