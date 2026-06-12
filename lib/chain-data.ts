// ── Multi-chain Wallet Balance (barrel) ──
// Re-exports from lib/api/ — kept for backward compatibility.

export type {
  TokenBalance,
  ChainBalance,
  WalletConfig,
} from './api/types';

export { fetchEthWallet } from './api/eth-chain';
export { fetchBnbWallet } from './api/bnb-chain';
export { fetchSolWallet } from './api/sol-chain';
export { fetchAllChainBalances } from './api/chain';
