// ── Multi-chain Aggregate ──

import type { ChainBalance, WalletConfig } from './types';
import { fetchEthWallet } from './eth-chain';
import { fetchBnbWallet } from './bnb-chain';
import { fetchSolWallet } from './sol-chain';

/**
 * Fetch all 3 chains in parallel. Each chain handles its own errors gracefully —
 * a failure on one chain doesn't affect the others.
 */
export async function fetchAllChainBalances(config: WalletConfig): Promise<ChainBalance[]> {
  const [eth, bnb, sol] = await Promise.allSettled([
    fetchEthWallet(config.eth),
    fetchBnbWallet(config.bnb),
    fetchSolWallet(config.sol),
  ]);

  const fallback = <T extends ChainBalance>(chain: T['chain']): T =>
    ({ chain, nativeBalance: 0, nativePrice: null, nativeChange24h: null, tokens: [], error: `${chain.toUpperCase()} 查询异常` }) as unknown as T;

  return [
    eth.status === 'fulfilled' ? eth.value : fallback('eth'),
    bnb.status === 'fulfilled' ? bnb.value : fallback('bnb'),
    sol.status === 'fulfilled' ? sol.value : fallback('sol'),
  ];
}
