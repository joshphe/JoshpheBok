'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChainBalance, WalletConfig } from '@/lib/chain-data';
import { fetchEthWallet, fetchBnbWallet, fetchSolWallet } from '@/lib/chain-data';
import type {
  PortfolioSummary,
  PortfolioAsset,
  AlertItem,
  DashboardData,
} from './types';

// ── Cost Basis Configuration ──

const COST_BASIS: Record<string, number> = {
  ETH: 3200,
  BNB: 580,
  SOL: 95,
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 1.0,   // USDT (ERC-20)
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 1.0,   // USDC (ERC-20)
  '0x55d398326f99059ff775485246999027b3197955': 1.0,   // USDT (BSC)
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': 1.0,   // USDC (BSC)
};

function getCostBasis(symbol: string, contractAddress?: string): number {
  if (contractAddress) {
    const k = contractAddress.toLowerCase();
    if (COST_BASIS[k] !== undefined) return COST_BASIS[k];
  }
  if (COST_BASIS[symbol] !== undefined) return COST_BASIS[symbol];
  return 0;
}

const POLL_INTERVAL = 5 * 60 * 1000;

// ── Convert chain balances → assets ──

const MIN_TOKEN_VALUE_USD = 2; // Only show tokens worth ≥ $2

function chainToAssets(cb: ChainBalance): PortfolioAsset[] {
  const assets: PortfolioAsset[] = [];
  const nativeNames: Record<string, string> = { eth: 'Ethereum', bnb: 'BNB', sol: 'Solana' };
  const nativeSymbols: Record<string, string> = { eth: 'ETH', bnb: 'BNB', sol: 'SOL' };

  const symbol = nativeSymbols[cb.chain] ?? cb.chain.toUpperCase();
  const name = nativeNames[cb.chain] ?? cb.chain;
  const price = cb.nativePrice ?? 0;
  const amount = cb.nativeBalance;
  const cost = getCostBasis(symbol);

  // Always show native coin if balance > 0
  if (amount > 0) {
    assets.push({
      symbol, name, amount, currentPrice: price, costBasis: cost,
      valueUSD: amount * price,
      pnlPercent: cost > 0 ? ((price - cost) / cost) * 100 : 0,
      change24hPercent: cb.nativeChange24h ?? 0,
      allocationPercent: 0,
    });
  }

  // Only show tokens worth ≥ $2
  for (const t of cb.tokens) {
    const tp = t.price ?? 0;
    const tv = t.balance * tp;
    if (t.balance > 0 && tv >= MIN_TOKEN_VALUE_USD) {
      const tc = getCostBasis(t.symbol, t.contractAddress);
      assets.push({
        symbol: t.symbol,
        name: t.name,
        amount: t.balance,
        currentPrice: tp,
        costBasis: tc,
        valueUSD: tv,
        pnlPercent: tc > 0 ? ((tp - tc) / tc) * 100 : 0,
        change24hPercent: t.change24hPercent ?? 0,
        allocationPercent: 0,
      });
    }
  }
  return assets;
}

function mergeAndSort(allAssets: PortfolioAsset[]): PortfolioAsset[] {
  const total = allAssets.reduce((s, a) => s + a.valueUSD, 0);
  const result = allAssets.map((a) => ({
    ...a,
    allocationPercent: total > 0 ? (a.valueUSD / total) * 100 : 0,
  }));
  result.sort((a, b) => b.valueUSD - a.valueUSD);
  return result;
}

function computeSummary(assets: PortfolioAsset[], lastUpdated: Date): PortfolioSummary | null {
  if (assets.length === 0) return null;
  const totalValueUSD = assets.reduce((s, a) => s + a.valueUSD, 0);
  const totalCostBasis = assets.reduce((s, a) => s + a.amount * a.costBasis, 0);
  const pnl24h = assets.reduce((s, a) => {
    if (a.change24hPercent === 0) return s;
    const ago = a.currentPrice / (1 + a.change24hPercent / 100);
    return s + a.amount * (a.currentPrice - ago);
  }, 0);
  const pnl24hPercent = totalValueUSD - pnl24h > 0 ? (pnl24h / (totalValueUSD - pnl24h)) * 100 : 0;
  return {
    totalValueUSD, pnl24h, pnl24hPercent,
    unrealizedPnl: totalValueUSD - totalCostBasis,
    totalCostBasis,
    pnl7d: null, pnl7dPercent: null,
    lastUpdated: lastUpdated.toISOString(),
  };
}

function generateAlerts(assets: PortfolioAsset[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date().toISOString();
  for (const a of assets) {
    if (a.allocationPercent > 35) {
      alerts.push({
        id: `conc-${a.symbol}`, type: 'concentration',
        title: `${a.symbol} 集中度过高`,
        message: `${a.symbol} 占投资组合的 ${a.allocationPercent.toFixed(1)}%，建议分散配置。`,
        severity: a.allocationPercent > 50 ? 'critical' : 'warning',
        timestamp: now,
      });
    }
  }
  for (const a of assets) {
    if (Math.abs(a.change24hPercent) > 10) {
      alerts.push({
        id: `price-${a.symbol}`, type: 'price',
        title: `${a.symbol} 24h 波动 ${a.change24hPercent > 0 ? '+' : ''}${a.change24hPercent.toFixed(1)}%`,
        message: `${a.symbol} 24小时内价格大幅${a.change24hPercent > 0 ? '上涨' : '下跌'}，请关注市场动态。`,
        severity: Math.abs(a.change24hPercent) > 20 ? 'critical' : 'info',
        timestamp: now,
      });
    }
  }
  return alerts;
}

// ── Hook: Incremental per-chain loading ──

export function usePortfolio(addresses: WalletConfig | null): DashboardData & {
  chainErrors: Record<string, string | undefined>;
} {
  // Per-chain state — each chain updates independently
  const [ethData, setEthData] = useState<ChainBalance | null>(null);
  const [bnbData, setBnbData] = useState<ChainBalance | null>(null);
  const [solData, setSolData] = useState<ChainBalance | null>(null);

  const [chainErrors, setChainErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const cancelled = useRef(false);
  const prevAddrs = useRef<string>('');

  // Compute merged assets/summary/alerts from per-chain state
  const allChains = [ethData, bnbData, solData].filter(Boolean) as ChainBalance[];
  const assets = mergeAndSort(allChains.flatMap((cb) => chainToAssets(cb)));
  const summary = computeSummary(assets, lastUpdated ?? new Date());
  const alerts = generateAlerts(assets);

  const load = useCallback(async () => {
    if (!addresses) {
      setIsLoading(false);
      return;
    }

    const addrKey = `${addresses.eth}|${addresses.bnb}|${addresses.sol}`;
    const isRefresh = prevAddrs.current === addrKey && (ethData || bnbData || solData);

    if (!isRefresh) setIsLoading(true);
    else setIsRefreshing(true);

    const errors: Record<string, string | undefined> = {};
    const now = new Date();

    // Fire all 3 chains in parallel — each updates state independently as it resolves
    const tasks = [
      { chain: 'eth' as const, fn: fetchEthWallet, addr: addresses.eth },
      { chain: 'bnb' as const, fn: fetchBnbWallet, addr: addresses.bnb },
      { chain: 'sol' as const, fn: fetchSolWallet, addr: addresses.sol },
    ];

    await Promise.allSettled(
      tasks.map(async ({ chain, fn, addr }) => {
        if (cancelled.current) return;
        try {
          const result = await fn(addr);
          if (cancelled.current) return;
          if (chain === 'eth') setEthData(result);
          if (chain === 'bnb') setBnbData(result);
          if (chain === 'sol') setSolData(result);
          if (result.error) errors[chain] = result.error;
        } catch (err) {
          if (cancelled.current) return;
          errors[chain] = err instanceof Error ? err.message : `${chain} 查询失败`;
        }
      }),
    );

    if (cancelled.current) return;

    setChainErrors(errors);
    setLastUpdated(now);
    setError(null);
    prevAddrs.current = addrKey;
    setIsLoading(false);
    setIsRefreshing(false);
  }, [addresses]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    setError(null);
    setEthData(null);
    setBnbData(null);
    setSolData(null);
    setIsLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    cancelled.current = false;
    load();
    const interval = setInterval(load, POLL_INTERVAL);
    return () => {
      cancelled.current = true;
      clearInterval(interval);
    };
  }, [load]);

  return {
    summary, assets, alerts, isLoading, isRefreshing,
    error, retry, lastUpdated, chainErrors,
  };
}
