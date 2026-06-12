// ── Solana (multiple public RPCs with fallback) ──

import { fetchJson, rpcCall } from './fetcher';
import type { ChainBalance, TokenBalance } from './types';

const SOL_RPCS = [
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
];

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

interface SolBalanceResult {
  value: number;
}

interface SolTokenAccount {
  account: {
    data: {
      parsed?: {
        info: {
          mint: string;
          tokenAmount: { uiAmount: number; decimals: number };
        };
      };
    };
  };
}

interface SolTokenAccountsResult {
  value: SolTokenAccount[];
}

interface BinanceTicker {
  lastPrice: string;
  priceChangePercent: string;
}

export async function fetchSolWallet(address: string): Promise<ChainBalance> {
  const addr = address.trim();
  if (!addr) {
    return { chain: 'sol', nativeBalance: 0, nativePrice: null, nativeChange24h: null, tokens: [], error: '未配置地址' };
  }

  try {
    // 1. SOL balance
    const solResult = await rpcCall<SolBalanceResult>(SOL_RPCS, 'getBalance', [addr]);
    const nativeBalance = (solResult?.value ?? 0) / 1e9;

    // 2. SOL price from Binance
    let nativePrice: number | null = null;
    let nativeChange24h: number | null = null;
    try {
      const ticker = await fetchJson<BinanceTicker>('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT');
      nativePrice = parseFloat(ticker.lastPrice);
      nativeChange24h = parseFloat(ticker.priceChangePercent);
    } catch {
      console.warn('[ChainData] SOL price fetch failed');
    }

    // 3. SPL token accounts
    let tokens: TokenBalance[] = [];
    try {
      const tokenAccounts = await rpcCall<SolTokenAccountsResult>(SOL_RPCS, 'getTokenAccountsByOwner', [
        addr,
        { programId: TOKEN_PROGRAM_ID },
        { encoding: 'jsonParsed' },
      ]);

      for (const ta of tokenAccounts?.value ?? []) {
        const info = ta.account?.data?.parsed?.info;
        if (info && info.tokenAmount.uiAmount > 0) {
          tokens.push({
            symbol: info.mint.slice(0, 6).toUpperCase(),
            name: info.mint.slice(0, 10) + '...',
            contractAddress: info.mint,
            balance: info.tokenAmount.uiAmount,
            decimals: info.tokenAmount.decimals,
            price: null,
            change24hPercent: null,
          });
        }
      }
    } catch {
      console.warn('[ChainData] SPL tokens query failed (may be rate-limited)');
    }

    return { chain: 'sol', nativeBalance, nativePrice, nativeChange24h, tokens };
  } catch (err) {
    console.warn('[ChainData] SOL fetch failed:', err instanceof Error ? err.message : err);
    return {
      chain: 'sol', nativeBalance: 0, nativePrice: null, nativeChange24h: null,
      tokens: [], error: err instanceof Error ? err.message : 'SOL 查询失败',
    };
  }
}
