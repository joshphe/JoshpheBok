'use client';

import { useState } from 'react';
import type { Transaction } from './types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

interface Props {
  transactions: Transaction[];
  assetType: 'stock' | 'crypto';
  isLoading: boolean;
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function TransactionList({ transactions, assetType, isLoading, onEdit, onDelete }: Props) {
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

  if (isLoading) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>交易记录</h3>
        <div className={styles.tableWrap}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.tableSkelRow}>
              <div className={styles.skelLine} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        交易记录
        <span className={styles.sectionCount}>{transactions.length} 笔</span>
      </h3>

      {transactions.length === 0 ? (
        <div className={styles.empty}>
          <p>暂无交易记录</p>
          <p className={styles.emptySub}>点击上方按钮添加第一笔交易</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>日期</th>
                <th>类型</th>
                <th>代码</th>
                <th>名称</th>
                <th>价格</th>
                <th>数量</th>
                <th>金额</th>
                <th>手续费</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className={styles.tdDate}>{t.tx_date}</td>
                  <td>
                    <span className={`${styles.txBadge} ${t.tx_type === 'buy' ? styles.buyBadge : styles.sellBadge}`}>
                      {t.tx_type === 'buy' ? '买入' : '卖出'}
                    </span>
                  </td>
                  <td className={styles.tdSymbol}>{t.symbol}</td>
                  <td className={styles.tdName}>{t.name || '--'}</td>
                  <td className={styles.tdNum}>{formatCurrency(t.price)}</td>
                  <td className={styles.tdNum}>{t.quantity.toLocaleString()}</td>
                  <td className={styles.tdNum}>{formatCurrency(t.price * t.quantity)}</td>
                  <td className={styles.tdNum}>{t.fee > 0 ? formatCurrency(t.fee) : '--'}</td>
                  <td className={styles.tdActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => onEdit(t)}
                      title="编辑"
                    >
                      ✏️
                    </button>
                    {confirmId === t.id ? (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                        >
                          {deletingId === t.id ? '...' : '确认'}
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setConfirmId(null)}
                        >
                          取消
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.actionBtn}
                        onClick={() => setConfirmId(t.id)}
                        title="删除"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
