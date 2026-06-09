'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/components/FinanceTicker.module.scss';

interface TickerItem {
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number | null;
}

const DOTS: Record<string, string> = {
  BTC: '#F7931A', ETH: '#627EEA', BNB: '#F3BA2F',
  NVDA: '#76B900', AAPL: '#555555', GOOGL: '#4285F4',
};

function formatPrice(p: number | null): string {
  if (p == null) return '—';
  if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return '$' + p.toFixed(2);
  return '$' + p.toPrecision(4);
}

function fmtChange(c: number | null): string {
  if (c == null) return '—';
  return `${c > 0 ? '+' : ''}${c.toFixed(2)}%`;
}

// ── Direct fetch — no custom hook ──

async function fetchCrypto(): Promise<TickerItem[]> {
  const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22BNBUSDT%22%5D');
  const data = await res.json();
  const names: Record<string, string> = { BTCUSDT: 'BTC', ETHUSDT: 'ETH', BNBUSDT: 'BNB' };
  return data.map((t: { symbol: string; lastPrice: string; priceChangePercent: string }) => ({
    symbol: names[t.symbol] ?? t.symbol,
    name: names[t.symbol] ?? t.symbol,
    price: parseFloat(t.lastPrice),
    changePercent: parseFloat(t.priceChangePercent),
  }));
}

async function fetchStocks(): Promise<TickerItem[]> {
  const symbols = [
    { sym: 'NVDA', secid: '105.NVDA', name: 'NVIDIA' },
    { sym: 'AAPL', secid: '105.AAPL', name: 'Apple' },
    { sym: 'GOOGL', secid: '105.GOOGL', name: 'Alphabet' },
  ];
  const results: TickerItem[] = [];
  for (const s of symbols) {
    const res = await fetch(`https://push2.eastmoney.com/api/qt/stock/get?secid=${s.secid}&fields=f43,f57,f170`);
    if (!res.ok) continue;
    const json = await res.json();
    const d = json?.data;
    if (!d || d.f43 == null) continue;
    results.push({
      symbol: s.sym,
      name: s.name,
      price: d.f43 / 1000,
      changePercent: d.f170 != null ? d.f170 / 100 : null,
    });
  }
  return results;
}

// ── Component ──

export default function FinanceTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      const localCancelled = (): boolean => cancelled;
      console.log('[FinanceTicker] fetching...');
      try {
        const [crypto, stocks] = await Promise.all([fetchCrypto(), fetchStocks()]);
        if (localCancelled()) return;
        const all = [...crypto, ...stocks];
        console.log('[FinanceTicker] got data:', all.length, 'items');
        setItems(all);
      } catch (err) {
        if (localCancelled()) return;
        console.error('[FinanceTicker] fetch error:', err);
      }
    }

    // Initial fetch
    fetchAll();

    // Poll every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Duplicate for marquee
  const doubled = [...items, ...items];

  return (
    <div className={styles.strip}>
      <div className={styles.track}>
        <div className={styles.run}>
          {doubled.length > 0 ? (
            doubled.map((item, i) => {
              const up = item.changePercent != null && item.changePercent >= 0;
              const down = item.changePercent != null && item.changePercent < 0;
              return (
                <span key={i} className={styles.item}>
                  <span className={styles.dot} style={{ background: DOTS[item.symbol] ?? 'var(--color-primary)' }} />
                  <span className={styles.symbol}>{item.symbol}</span>
                  <span className={styles.price}>{formatPrice(item.price)}</span>
                  <span className={`${styles.change} ${up ? styles.up : ''} ${down ? styles.down : ''}`}>
                    {fmtChange(item.changePercent)}
                  </span>
                </span>
              );
            })
          ) : (
            <span className={styles.placeholder}>加载中...</span>
          )}
        </div>
      </div>
    </div>
  );
}
