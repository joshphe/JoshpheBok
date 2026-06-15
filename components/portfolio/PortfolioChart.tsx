'use client';

import { useState, useMemo } from 'react';
import type { Transaction } from './types';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

// ── Types ──

interface ChartPoint {
  date: Date;
  totalValue: number;
}

type Period = '1w' | '1m' | '180d' | '1y' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  '1w': '1周',
  '1m': '1月',
  '180d': '180天',
  '1y': '1年',
  'all': '全部',
};

const PERIOD_DAYS: Record<Period, number> = {
  '1w': 7,
  '1m': 30,
  '180d': 180,
  '1y': 365,
  'all': Infinity,
};

/** How many regularly-spaced grid points to generate per period */
const GRID_POINTS: Record<Period, number> = {
  '1w': 7,      // daily
  '1m': 15,     // every 2 days
  '180d': 18,   // every 10 days
  '1y': 8,      // bimonthly
  'all': 0,     // use raw snapshots
};

// ── Portfolio state snapshots at each transaction date ──

interface StateSnapshot {
  date: Date;
  totalValue: number;
}

function computeSnapshots(
  transactions: Transaction[],
  marketPrices: Record<string, number>,
): StateSnapshot[] {
  if (transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) => a.tx_date.localeCompare(b.tx_date));
  const snapshots: StateSnapshot[] = [];
  const state = new Map<string, { qty: number; cost: number }>();

  for (const tx of sorted) {
    const s = state.get(tx.symbol.toUpperCase()) ?? { qty: 0, cost: 0 };

    if (tx.tx_type === 'buy') {
      s.qty += tx.quantity;
      s.cost += tx.price * tx.quantity + tx.fee;
    } else if (s.qty > 0) {
      const avgCost = s.cost / s.qty;
      const sellQty = Math.min(tx.quantity, s.qty);
      s.qty -= sellQty;
      s.cost -= avgCost * sellQty;
    }

    state.set(tx.symbol.toUpperCase(), s);

    let totalMarketValue = 0;
    for (const [sym, v] of state) {
      if (v.qty > 0) {
        totalMarketValue += (marketPrices[sym] ?? 0) * v.qty;
      }
    }

    snapshots.push({
      date: new Date(tx.tx_date + 'T00:00:00'),
      totalValue: totalMarketValue,
    });
  }

  return snapshots;
}

// ── Build regularly-spaced time grid ──

function buildTimeGrid(snapshots: StateSnapshot[], period: Period): ChartPoint[] {
  const maxDays = PERIOD_DAYS[period];
  const gridPoints = GRID_POINTS[period];

  if (snapshots.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For "all", use raw snapshots + today (no grid interpolation)
  if (maxDays === Infinity || gridPoints === 0) {
    const last = snapshots[snapshots.length - 1];
    if (last.date.getTime() !== today.getTime()) {
      return [...snapshots, { date: today, totalValue: last.totalValue }];
    }
    return snapshots;
  }

  // Build N+1 regularly-spaced dates (including both ends)
  const start = new Date(today);
  start.setDate(start.getDate() - maxDays);

  const result: ChartPoint[] = [];
  for (let i = 0; i <= gridPoints; i++) {
    const d = new Date(start.getTime() + (i / gridPoints) * maxDays * 86400 * 1000);
    d.setHours(0, 0, 0, 0);

    // Find closest snapshot at or before this date
    let value: number;
    // Use the last snapshot before or at date d
    let bestIdx = -1;
    for (let j = snapshots.length - 1; j >= 0; j--) {
      if (snapshots[j].date <= d) {
        bestIdx = j;
        break;
      }
    }
    if (bestIdx === -1) {
      // No snapshot before this grid date — use first snapshot
      value = snapshots[0].totalValue;
    } else {
      value = snapshots[bestIdx].totalValue;
    }

    result.push({ date: d, totalValue: value });
  }

  // Ensure last point is today
  const lastPt = result[result.length - 1];
  if (lastPt && lastPt.date.getTime() !== today.getTime()) {
    result.push({ date: today, totalValue: lastPt.totalValue });
  }

  return result;
}

// ── X-axis tick selection ──

interface XTick {
  index: number;
  label: string;
}

function selectXTicks(points: ChartPoint[], period: Period): XTick[] {
  if (points.length === 0) return [];
  const ticks: XTick[] = [];

  function label(d: Date): string {
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  }

  if (period === '1w') {
    // Show every other day to avoid label crowding
    for (let i = 0; i < points.length; i += 2) {
      ticks.push({ index: i, label: label(points[i].date) });
    }
    if (ticks.length > 0 && ticks[ticks.length - 1].index !== points.length - 1) {
      ticks.push({ index: points.length - 1, label: label(points[points.length - 1].date) });
    }
    return ticks;
  }

  if (period === '1m') {
    // Show ~6 labels across the month
    const step = Math.max(1, Math.floor(points.length / 6));
    for (let i = 0; i < points.length; i += step) {
      ticks.push({ index: i, label: label(points[i].date) });
    }
    // Always include last point
    if (ticks.length > 0 && ticks[ticks.length - 1].index !== points.length - 1) {
      ticks.push({ index: points.length - 1, label: label(points[points.length - 1].date) });
    }
    return ticks;
  }

  // 180d: ~6 labels; 1y: ~5 labels (bimonthly snapshots)
  const targetCount = period === '180d' ? 6 : 5;
  const step = Math.max(1, Math.floor(points.length / targetCount));
  for (let i = 0; i < points.length; i += step) {
    ticks.push({ index: i, label: label(points[i].date) });
  }
  if (ticks.length > 0 && ticks[ticks.length - 1].index !== points.length - 1) {
    ticks.push({ index: points.length - 1, label: label(points[points.length - 1].date) });
  }
  return ticks;
}

// ── Formatting ──

function fmtCurrency(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

// ── Component ──

interface Props {
  transactions: Transaction[];
  marketPrices: Record<string, number>;
}

export default function PortfolioChart({ transactions, marketPrices }: Props) {
  const [period, setPeriod] = useState<Period>('1m');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chartPoints = useMemo(() => {
    const snapshots = computeSnapshots(transactions, marketPrices);
    return buildTimeGrid(snapshots, period);
  }, [transactions, marketPrices, period]);

  if (transactions.length === 0) {
    return (
      <div className={styles.chartCard}>
        <p className={styles.chartEmpty}>暂无交易数据，添加交易后将显示资产曲线</p>
      </div>
    );
  }

  if (chartPoints.length < 2) {
    return (
      <div className={styles.chartCard}>
        <p className={styles.chartEmpty}>数据点不足，继续添加交易后将显示曲线</p>
      </div>
    );
  }

  // ── Layout ──
  const W = 640;
  const H = 180;
  const PAD_TOP = 12;
  const PAD_BOTTOM = 30;
  const PAD_LEFT = 52;
  const PAD_RIGHT = 16;
  const CHART_W = W - PAD_LEFT - PAD_RIGHT;
  const CHART_H = H - PAD_TOP - PAD_BOTTOM;

  // Data range
  const values = chartPoints.map((p) => p.totalValue);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const yMin = Math.max(0, minVal - range * 0.12);
  const yMax = maxVal + range * 0.12;

  const toX = (i: number) => PAD_LEFT + (i / (chartPoints.length - 1)) * CHART_W;
  const toY = (v: number) => PAD_TOP + CHART_H - ((v - yMin) / (yMax - yMin)) * CHART_H;
  const baselineY = toY(yMin);

  function smoothPath(pts: ChartPoint[]): string {
    if (pts.length < 2) return '';
    let d = `M${toX(0)},${toY(pts[0].totalValue)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (toX(i) + toX(i + 1)) / 2;
      const cy = (toY(pts[i].totalValue) + toY(pts[i + 1].totalValue)) / 2;
      d += ` Q${toX(i)},${toY(pts[i].totalValue)} ${cx},${cy}`;
      d += ` Q${toX(i + 1)},${toY(pts[i + 1].totalValue)} ${toX(i + 1)},${toY(pts[i + 1].totalValue)}`;
    }
    return d;
  }

  function areaPath(pts: ChartPoint[]): string {
    return `${smoothPath(pts)} L${toX(pts.length - 1)},${baselineY} L${toX(0)},${baselineY} Z`;
  }

  // Y ticks
  const yTicks = 4;
  const yStep = (yMax - yMin) / yTicks;
  const yTickValues: number[] = [];
  for (let i = 0; i <= yTicks; i++) yTickValues.push(yMin + yStep * i);

  // X ticks
  const xTicks = selectXTicks(chartPoints, period);

  const gradientId = 'chartAreaGradient';
  const lineGradientId = 'chartLineGradient';

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>资产变化</span>
        <div className={styles.chartPeriodBar}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              className={`${styles.chartPeriodBtn} ${period === p ? styles.chartPeriodActive : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.chartSvg}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary-light)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
          <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* Grid lines */}
        {yTickValues.map((v, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={PAD_LEFT} y1={toY(v)} x2={W - PAD_RIGHT} y2={toY(v)}
              stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3,4" opacity="0.5"
            />
            <text
              x={PAD_LEFT - 6} y={toY(v) + 4}
              textAnchor="end" fontSize="10" fill="var(--color-text-secondary)"
            >
              {fmtCurrency(v)}
            </text>
          </g>
        ))}

        {/* X axis line */}
        <line
          x1={PAD_LEFT} y1={baselineY} x2={W - PAD_RIGHT} y2={baselineY}
          stroke="var(--color-border)" strokeWidth="1" opacity="0.6"
        />

        {/* X axis labels */}
        {xTicks.map((t) => (
          <text
            key={`x-${t.index}`}
            x={toX(t.index)} y={H - 6}
            textAnchor="middle" fontSize="10" fill="var(--color-text-secondary)"
          >
            {t.label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath(chartPoints)} fill={`url(#${gradientId})`} />

        {/* Asset value line */}
        <path
          d={smoothPath(chartPoints)}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive dots & hit areas */}
        {chartPoints.map((p, i) => (
          <g key={`pt-${i}`}>
            <circle
              cx={toX(i)} cy={toY(p.totalValue)} r="10"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
            <circle
              cx={toX(i)} cy={toY(p.totalValue)}
              r={hoverIdx === i ? 5 : 3}
              fill={hoverIdx === i ? 'var(--color-primary)' : 'var(--color-surface)'}
              stroke="var(--color-primary)"
              strokeWidth="1.5"
              style={{ transition: 'r 0.15s, fill 0.15s' }}
              pointerEvents="none"
            />
          </g>
        ))}

        {/* Vertical guide line */}
        {hoverIdx != null && (
          <line
            x1={toX(hoverIdx)} y1={PAD_TOP}
            x2={toX(hoverIdx)} y2={baselineY}
            stroke="var(--color-text-secondary)"
            strokeWidth="0.8"
            strokeDasharray="3,3"
            opacity="0.4"
          />
        )}

        {/* Tooltip */}
        {hoverIdx != null && (() => {
          const pt = chartPoints[hoverIdx];
          const cx = toX(hoverIdx);
          const cy = toY(pt.totalValue);
          const dateStr = `${pt.date.getFullYear()}/${pt.date.getMonth() + 1}/${pt.date.getDate()}`;
          const valStr = fmtCurrency(pt.totalValue);

          const tipW = 110;
          const tipH = 36;
          let tipX = cx - tipW / 2;
          if (tipX < PAD_LEFT) tipX = PAD_LEFT + 4;
          if (tipX + tipW > W - PAD_RIGHT) tipX = W - PAD_RIGHT - tipW - 4;
          const tipY = cy - tipH - 12;
          const finalTipY = tipY > PAD_TOP ? tipY : cy + 14;

          return (
            <g>
              <rect
                x={tipX} y={finalTipY}
                width={tipW} height={tipH} rx="6"
                fill="var(--color-surface)"
                stroke="var(--color-border)"
                strokeWidth="0.8"
                filter="url(#tooltipShadow)"
              />
              <text x={tipX + tipW / 2} y={finalTipY + 14}
                textAnchor="middle" fontSize="10" fontWeight="600"
                fill="var(--color-text)"
              >
                {valStr}
              </text>
              <text x={tipX + tipW / 2} y={finalTipY + 28}
                textAnchor="middle" fontSize="9"
                fill="var(--color-text-secondary)"
              >
                {dateStr}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
