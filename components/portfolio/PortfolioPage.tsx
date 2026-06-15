'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { usePortfolioStore } from './usePortfolioStore';
import { usePolling } from '@/hooks/usePolling';
import { fetchStockPrices, fetchCryptoPrices } from './marketPrices';
import type { Transaction, TransactionInput, PortfolioSummary } from './types';
import PortfolioSummaryCards from './PortfolioSummary';
import PortfolioChart from './PortfolioChart';
import HoldingList from './HoldingList';
import AddTransactionModal from './AddTransactionModal';
import TransactionDetailModal from './TransactionDetailModal';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

type FilterType = 'all' | 'stock' | 'crypto';

export default function PortfolioPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const stockStore = usePortfolioStore('stock');
  const cryptoStore = usePortfolioStore('crypto');

  // Merge both stores into a unified view
  const allTransactions = useMemo(
    () => [...stockStore.transactions, ...cryptoStore.transactions],
    [stockStore.transactions, cryptoStore.transactions],
  );

  const allHoldings = useMemo(
    () => [...stockStore.holdings, ...cryptoStore.holdings],
    [stockStore.holdings, cryptoStore.holdings],
  );

  const filteredHoldings = filter === 'all'
    ? allHoldings
    : allHoldings.filter((h) => {
      const t = allTransactions.find(
        (tx) => tx.symbol.toUpperCase() === h.symbol.toUpperCase(),
      );
      return t ? t.asset_type === filter : false;
    });

  const isLoading = stockStore.isLoading || cryptoStore.isLoading;
  const error = stockStore.error || cryptoStore.error;

  // ── Market prices ──

  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});

  const fetchPrices = useCallback(async (_signal: AbortSignal) => {
    try {
      const stockSymbols = stockStore.holdings.filter((h) => h.totalQuantity > 0).map((h) => h.symbol);
      const cryptoSymbols = cryptoStore.holdings.filter((h) => h.totalQuantity > 0).map((h) => h.symbol);
      const [sp, cp] = await Promise.all([
        stockSymbols.length > 0 ? fetchStockPrices(stockSymbols) : Promise.resolve({}),
        cryptoSymbols.length > 0 ? fetchCryptoPrices(cryptoSymbols) : Promise.resolve({}),
      ]);
      setMarketPrices({ ...sp, ...cp });
    } catch { /* best-effort */ }
  }, [stockStore.holdings, cryptoStore.holdings]);

  usePolling(fetchPrices, 5 * 60 * 1000, { immediate: true });

  const holdingsKey = useMemo(() => [
    ...stockStore.holdings.filter((h) => h.totalQuantity > 0).map((h) => h.symbol).sort(),
    ...cryptoStore.holdings.filter((h) => h.totalQuantity > 0).map((h) => h.symbol).sort(),
  ].join(','), [stockStore.holdings, cryptoStore.holdings]);

  // Re-fetch prices when holdings change (new/edited/deleted transaction)
  useEffect(() => {
    const controller = new AbortController();
    fetchPrices(controller.signal);
    return () => controller.abort();
  }, [holdingsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge prices into FILTERED holdings
  const holdingsWithPrices = useMemo(() => filteredHoldings.map((h) => {
    const currentPrice = marketPrices[h.symbol.toUpperCase()] ?? null;
    if (currentPrice != null && h.totalQuantity > 0) {
      const currentValue = currentPrice * h.totalQuantity;
      const unrealizedPnl = currentValue - h.totalCost;
      const unrealizedPnlPercent = h.totalCost > 0 ? (unrealizedPnl / h.totalCost) * 100 : 0;
      return { ...h, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPercent };
    }
    return h;
  }), [filteredHoldings, marketPrices]);

  // Summary from filtered holdings
  const summary: PortfolioSummary | null = useMemo(() => {
    let totalValue = 0, totalCost = 0, unrealizedSum: number | null = null, realizedSum = 0, count = 0;
    for (const h of holdingsWithPrices) {
      realizedSum += h.realizedPnl;
      if (h.totalQuantity > 0) {
        count++;
        totalCost += h.totalCost;
        totalValue += h.currentValue ?? h.totalCost;
        if (h.unrealizedPnl != null) unrealizedSum = (unrealizedSum ?? 0) + h.unrealizedPnl;
      }
    }
    const totalPnl = realizedSum + (unrealizedSum ?? 0);
    return {
      totalValue, totalCost, totalPnl,
      totalPnlPercent: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
      holdingCount: count,
      realizedPnl: realizedSum,
      unrealizedPnl: unrealizedSum,
    };
  }, [holdingsWithPrices]);

  // ── Actions ──

  const handleAdd = () => {
    setEditTransaction(null);
    setShowModal(true);
  };

  const handleEdit = (t: Transaction) => {
    setSelectedSymbol(null);
    setEditTransaction(t);
    setShowModal(true);
  };

  const handleSave = useCallback(async (input: TransactionInput) => {
    const store = input.asset_type === 'crypto' ? cryptoStore : stockStore;
    if (editTransaction) {
      await store.updateTransaction(editTransaction.id, input);
    } else {
      await store.addTransaction(input);
    }
  }, [editTransaction, stockStore, cryptoStore]);

  const handleDelete = useCallback(async (id: number, assetType?: 'stock' | 'crypto') => {
    // Find which store this transaction belongs to
    const txn = allTransactions.find((t) => t.id === id);
    const store = (txn?.asset_type ?? assetType) === 'crypto' ? cryptoStore : stockStore;
    await store.deleteTransaction(id);
  }, [allTransactions, stockStore, cryptoStore]);

  // Refresh both stores
  const refresh = useCallback(() => {
    stockStore.refresh();
    cryptoStore.refresh();
  }, [stockStore, cryptoStore]);

  // ── Transition ──

  const prevHadData = useRef(false);
  const hasData = allTransactions.length > 0;
  useEffect(() => { if (hasData) prevHadData.current = true; }, [hasData]);
  const showTransition = prevHadData.current;

  // Detail modal transactions
  const selectedTransactions = selectedSymbol
    ? allTransactions.filter((t) => t.symbol.toUpperCase() === selectedSymbol.toUpperCase())
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${showTransition ? styles.fadeIn : ''}`}>
          <h1 className={styles.title}>资产组合管理</h1>
          <p className={styles.subtitle}>
            共 <strong>{holdingsWithPrices.filter((h) => h.totalQuantity > 0).length}</strong> 个持仓
          </p>
          {error && (
            <p className={styles.errorBanner}>
              {error}
              <button className={styles.retryLink} onClick={refresh}>重试</button>
            </p>
          )}
        </div>

        {/* Filter + Add buttons */}
        <div className={`${styles.toolbar} ${showTransition ? styles.fadeIn : ''}`}>
          <div className={styles.filters}>
            {(['all', 'stock', 'crypto'] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '全部' : f === 'stock' ? '美股' : '虚拟货币'}
              </button>
            ))}
          </div>
          <div className={styles.addBtns}>
            <button className={styles.addBtn} onClick={handleAdd}>
              + 添加交易
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.05s' }}>
          <PortfolioSummaryCards summary={summary} isLoading={isLoading} />
        </div>

        {/* Chart */}
        <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.08s' }}>
          <PortfolioChart
            transactions={allTransactions}
            marketPrices={marketPrices}
          />
        </div>

        {/* Holdings */}
        <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.12s' }}>
          <HoldingList
            holdings={holdingsWithPrices}
            isLoading={isLoading}
            onSymbolClick={(symbol) => setSelectedSymbol(symbol)}
          />
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <AddTransactionModal
          editTransaction={editTransaction}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTransaction(null); }}
        />
      )}

      {selectedSymbol && (
        <TransactionDetailModal
          symbol={selectedSymbol}
          transactions={selectedTransactions}
          onClose={() => setSelectedSymbol(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
