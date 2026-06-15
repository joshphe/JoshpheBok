'use client';

import { useState } from 'react';
import type { Transaction } from './types';
import { formatCurrency } from '@/lib/utils';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

interface Props {
  symbol: string;
  transactions: Transaction[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function TransactionDetailModal({ symbol, transactions, onClose, onAdd, onEdit, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      setConfirmId(null);
    } catch {
      // error handled by parent
    } finally {
      setDeletingId(null);
    }
  };

  // Compute per-symbol summary
  let buyQty = 0, buyVal = 0, sellQty = 0, sellVal = 0, totalFee = 0;
  for (const t of transactions) {
    if (t.tx_type === 'buy') {
      buyQty += t.quantity;
      buyVal += t.price * t.quantity;
      totalFee += t.fee;
    } else {
      sellQty += t.quantity;
      sellVal += t.price * t.quantity;
      totalFee += t.fee;
    }
  }
  const avgCost = buyQty > 0 ? buyVal / buyQty : 0;
  const holding = buyQty - sellQty;
  const realizedPnl = sellQty > 0 ? sellVal - avgCost * sellQty : 0;

  const name = transactions[0]?.name || symbol;
  const isCrypto = transactions[0]?.asset_type === 'crypto';

  function fmtQty(value: number): string {
    if (isCrypto) return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 });
    return value.toLocaleString();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {symbol}
            {name !== symbol && <span className={styles.detailName}> — {name}</span>}
          </h3>
          <div className={styles.modalHeaderRight}>
            <button className={styles.addBtnSmall} onClick={onAdd}>+ 添加交易</button>
            <button className={styles.modalClose} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Summary bar */}
        <div className={styles.detailSummary}>
          <div className={styles.detailSummaryItem}>
            <span className={styles.detailSummaryLabel}>持仓</span>
            <span className={styles.detailSummaryVal}>{fmtQty(holding)}</span>
          </div>
          <div className={styles.detailSummaryItem}>
            <span className={styles.detailSummaryLabel}>均价</span>
            <span className={styles.detailSummaryVal}>{formatCurrency(avgCost)}</span>
          </div>
          <div className={styles.detailSummaryItem}>
            <span className={styles.detailSummaryLabel}>买入总额</span>
            <span className={styles.detailSummaryVal}>{formatCurrency(buyVal)}</span>
          </div>
          <div className={styles.detailSummaryItem}>
            <span className={styles.detailSummaryLabel}>已实现盈亏</span>
            <span className={`${styles.detailSummaryVal} ${realizedPnl >= 0 ? styles.up : styles.down}`}>
              {realizedPnl !== 0 ? formatCurrency(realizedPnl) : '--'}
            </span>
          </div>
        </div>

        {/* Transaction table */}
        <div className={styles.detailTableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>价格</th>
                <th>数量</th>
                <th>金额</th>
                <th>手续费</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.detailEmpty}>暂无交易记录</td>
                </tr>
              ) : (
                transactions
                  .sort((a, b) => b.tx_date.localeCompare(a.tx_date))
                  .map((t) => (
                    <tr key={t.id}>
                      <td className={styles.tdDate}>{t.tx_date}</td>
                      <td>
                        <span className={`${styles.txBadge} ${t.tx_type === 'buy' ? styles.buyBadge : styles.sellBadge}`}>
                          {t.tx_type === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className={styles.tdNum}>{formatCurrency(t.price)}</td>
                      <td className={styles.tdNum}>{fmtQty(t.quantity)}</td>
                      <td className={styles.tdNum}>{formatCurrency(t.price * t.quantity)}</td>
                      <td className={styles.tdNum}>{t.fee > 0 ? formatCurrency(t.fee) : '--'}</td>
                      <td className={styles.tdNote}>{t.notes || '--'}</td>
                      <td className={styles.tdActions}>
                        <button className={styles.actionBtn} onClick={() => onEdit(t)} title="编辑">编辑</button>
                        {confirmId === t.id ? (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.dangerBtn}`}
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                            >
                              {deletingId === t.id ? '...' : '确认'}
                            </button>
                            <button className={styles.actionBtn} onClick={() => setConfirmId(null)}>取消</button>
                          </>
                        ) : (
                          <button className={styles.actionBtn} onClick={() => setConfirmId(t.id)} title="删除">删除</button>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
