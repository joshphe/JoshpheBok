'use client';

import type { Holding } from './types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

interface Props {
  holdings: Holding[];
  isLoading: boolean;
  onSymbolClick?: (symbol: string) => void;
}

export default function HoldingList({ holdings, isLoading, onSymbolClick }: Props) {
  if (isLoading) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>持仓明细</h3>
        <div className={styles.holdingGrid}>
          {[1, 2].map((i) => (
            <div key={i} className={`${styles.holdingCard} ${styles.skeleton}`}>
              <div className={styles.skelLine} />
              <div className={`${styles.skelLine} ${styles.skelShort}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeHoldings = holdings.filter((h) => h.totalQuantity > 0);
  const closedPositions = holdings.filter((h) => h.totalQuantity <= 0);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        持仓明细
        <span className={styles.sectionCount}>
          {activeHoldings.length} 个持仓{closedPositions.length > 0 ? ` · ${closedPositions.length} 个已清仓` : ''}
        </span>
      </h3>

      {holdings.length === 0 ? (
        <div className={styles.empty}>
          <p>暂无持仓</p>
        </div>
      ) : (
        <>
          {activeHoldings.map((h) => (
            <HoldingCard
              key={h.symbol}
              holding={h}
              onClick={onSymbolClick}
            />
          ))}

          {closedPositions.length > 0 && (
            <details className={styles.closedSection}>
              <summary className={styles.closedSummary}>
                已清仓 ({closedPositions.length})
              </summary>
              {closedPositions.map((h) => (
                <HoldingCard
                  key={h.symbol}
                  holding={h}
                  isClosed
                  onClick={onSymbolClick}
                />
              ))}
            </details>
          )}
        </>
      )}
    </div>
  );
}

function HoldingCard({
  holding: h,
  isClosed = false,
  onClick,
}: {
  holding: Holding;
  isClosed?: boolean;
  onClick?: (symbol: string) => void;
}) {
  const isPositivePnl = h.totalQuantity > 0
    ? (h.unrealizedPnl ?? 0) >= 0
    : h.realizedPnl >= 0;

  return (
    <div
      className={`${styles.holdingCard} ${isClosed ? styles.closedCard : ''} ${onClick ? styles.clickable : ''}`}
      onClick={() => onClick?.(h.symbol)}
    >
      <div className={styles.holdingHeader}>
        <div className={styles.holdingSymbol}>
          <span className={styles.holdingIcon}>{isClosed ? '📭' : '📌'}</span>
          <span className={styles.holdingName}>{h.symbol}</span>
          {h.name && h.name !== h.symbol && (
            <span className={styles.holdingFullName}>{h.name}</span>
          )}
        </div>
        <div className={styles.holdingHeaderRight}>
          {isClosed && <span className={styles.closedTag}>已清仓</span>}
          {onClick && !isClosed && <span className={styles.detailHint}>查看交易 →</span>}
        </div>
      </div>

      <div className={styles.holdingBody}>
        <div className={styles.holdingStat}>
          <span className={styles.holdingStatLabel}>持仓数量</span>
          <span className={styles.holdingStatValue}>
            {h.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
          </span>
        </div>

        <div className={styles.holdingStat}>
          <span className={styles.holdingStatLabel}>平均成本</span>
          <span className={styles.holdingStatValue}>{formatCurrency(h.avgCost)}</span>
        </div>

        <div className={styles.holdingStat}>
          <span className={styles.holdingStatLabel}>总成本</span>
          <span className={styles.holdingStatValue}>{formatCurrency(h.totalCost)}</span>
        </div>

        {!isClosed && h.currentPrice != null && (
          <>
            <div className={styles.holdingStat}>
              <span className={styles.holdingStatLabel}>当前市价</span>
              <span className={styles.holdingStatValue}>{formatCurrency(h.currentPrice)}</span>
            </div>

            <div className={styles.holdingStat}>
              <span className={styles.holdingStatLabel}>当前市值</span>
              <span className={styles.holdingStatValue}>{formatCurrency(h.currentValue!)}</span>
            </div>

            <div className={styles.holdingStat}>
              <span className={styles.holdingStatLabel}>未实现盈亏</span>
              <span className={`${styles.holdingStatValue} ${isPositivePnl ? styles.up : styles.down}`}>
                {h.unrealizedPnl != null ? formatCurrency(h.unrealizedPnl) : '--'}
                {h.unrealizedPnlPercent != null && (
                  <span className={styles.pnlPercent}>
                    {' '}({formatPercent(h.unrealizedPnlPercent)})
                  </span>
                )}
              </span>
            </div>
          </>
        )}

        <div className={styles.holdingStat}>
          <span className={styles.holdingStatLabel}>已实现盈亏</span>
          <span className={`${styles.holdingStatValue} ${h.realizedPnl >= 0 ? styles.up : styles.down}`}>
            {formatCurrency(h.realizedPnl)}
          </span>
        </div>
      </div>
    </div>
  );
}
