'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Transaction, TransactionInput, Holding, PortfolioSummary, PortfolioState } from './types';

// ── Helpers ──

function computeHoldings(transactions: Transaction[]): Holding[] {
  const map = new Map<string, {
    symbol: string;
    name: string;
    buyQuantity: number;
    buyCost: number;
    sellQuantity: number;
    sellRevenue: number;
    sellCost: number;
  }>();

  for (const t of transactions) {
    const key = t.symbol.toUpperCase();
    if (!map.has(key)) {
      map.set(key, { symbol: t.symbol, name: t.name, buyQuantity: 0, buyCost: 0, sellQuantity: 0, sellRevenue: 0, sellCost: 0 });
    }
    const h = map.get(key)!;
    if (t.tx_type === 'buy') {
      h.buyQuantity += t.quantity;
      h.buyCost += t.price * t.quantity + t.fee;
    } else {
      h.sellQuantity += t.quantity;
      h.sellRevenue += t.price * t.quantity - t.fee;
      h.sellCost += t.price * t.quantity;
    }
    if (t.name && !h.name) h.name = t.name;
  }

  const holdings: Holding[] = [];
  for (const [, h] of map) {
    const totalQuantity = h.buyQuantity - h.sellQuantity;
    if (totalQuantity <= 0) {
      // Fully sold — only realized P&L matters
      holdings.push({
        symbol: h.symbol,
        name: h.name,
        totalQuantity: 0,
        avgCost: h.buyQuantity > 0 ? h.buyCost / h.buyQuantity : 0,
        totalCost: h.buyCost,
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        realizedPnl: h.sellRevenue - (h.sellQuantity / (h.buyQuantity || 1)) * h.buyCost,
      });
    } else {
      const avgCost = h.buyCost / h.buyQuantity;
      const remainingCost = avgCost * totalQuantity;
      const realizedPnl = h.sellRevenue - avgCost * h.sellQuantity;
      holdings.push({
        symbol: h.symbol,
        name: h.name,
        totalQuantity,
        avgCost,
        totalCost: remainingCost,
        currentPrice: null,
        currentValue: null,
        unrealizedPnl: null,
        unrealizedPnlPercent: null,
        realizedPnl,
      });
    }
  }

  return holdings.sort((a, b) => {
    if (a.totalQuantity > 0 && b.totalQuantity <= 0) return -1;
    if (a.totalQuantity <= 0 && b.totalQuantity > 0) return 1;
    return b.totalCost - a.totalCost;
  });
}

function computeSummary(holdings: Holding[]): PortfolioSummary {
  let totalValue = 0;
  let totalCost = 0;
  let realizedPnl = 0;
  let unrealizedPnl: number | null = null;
  let holdingCount = 0;

  for (const h of holdings) {
    realizedPnl += h.realizedPnl;
    if (h.totalQuantity > 0) {
      holdingCount++;
      totalCost += h.totalCost;
      if (h.currentValue != null) {
        totalValue += h.currentValue;
      } else {
        totalValue += h.totalCost;
      }
      if (h.unrealizedPnl != null) {
        unrealizedPnl = (unrealizedPnl ?? 0) + h.unrealizedPnl;
      }
    }
  }

  const totalPnl = realizedPnl + (unrealizedPnl ?? 0);
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent,
    holdingCount,
    realizedPnl,
    unrealizedPnl,
  };
}

// ── Hook ──

export function usePortfolioStore(assetType: 'stock' | 'crypto') {
  const [state, setState] = useState<PortfolioState>({
    transactions: [],
    holdings: [],
    summary: null,
    isLoading: true,
    error: null,
  });

  const cancelledRef = useRef(false);

  const client = getSupabase();

  const fetchTransactions = useCallback(async () => {
    if (!client) {
      setState((prev) => ({ ...prev, isLoading: false, error: 'Supabase 未配置' }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { data, error } = await client
        .from('transactions')
        .select('*')
        .eq('asset_type', assetType)
        .order('tx_date', { ascending: false });

      if (error) throw new Error(error.message);

      const transactions = (data ?? []) as Transaction[];
      const holdings = computeHoldings(transactions);
      const summary = computeSummary(holdings);

      if (!cancelledRef.current) {
        setState({ transactions, holdings, summary, isLoading: false, error: null });
      }
    } catch (err) {
      if (!cancelledRef.current) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : '获取交易记录失败',
        }));
      }
    }
  }, [assetType, client]);

  const addTransaction = useCallback(async (input: TransactionInput) => {
    if (!client) throw new Error('Supabase 未配置');
    const { error } = await client.from('transactions').insert({
      asset_type: input.asset_type,
      symbol: input.symbol,
      name: input.name,
      tx_type: input.tx_type,
      tx_date: input.tx_date,
      price: input.price,
      quantity: input.quantity,
      fee: input.fee,
      notes: input.notes,
    });

    if (error) throw new Error(error.message);
    await fetchTransactions();
  }, [fetchTransactions, client]);

  const updateTransaction = useCallback(async (id: number, input: TransactionInput) => {
    if (!client) throw new Error('Supabase 未配置');
    const { error } = await client
      .from('transactions')
      .update({
        asset_type: input.asset_type,
        symbol: input.symbol,
        name: input.name,
        tx_type: input.tx_type,
        tx_date: input.tx_date,
        price: input.price,
        quantity: input.quantity,
        fee: input.fee,
        notes: input.notes,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    await fetchTransactions();
  }, [fetchTransactions, client]);

  const deleteTransaction = useCallback(async (id: number) => {
    if (!client) throw new Error('Supabase 未配置');
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    await fetchTransactions();
  }, [fetchTransactions, client]);

  useEffect(() => {
    cancelledRef.current = false;
    fetchTransactions();
    return () => { cancelledRef.current = true; };
  }, [fetchTransactions]);

  return {
    ...state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
  };
}
