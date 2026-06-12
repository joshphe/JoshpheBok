// ── Portfolio domain types ──

export interface Transaction {
  id: number;
  user_id?: string;
  asset_type: 'stock' | 'crypto';
  symbol: string;
  name: string;
  tx_type: 'buy' | 'sell';
  tx_date: string;
  price: number;
  quantity: number;
  fee: number;
  notes: string;
}

/** Input type for add/update — omits server-generated fields */
export interface TransactionInput {
  asset_type: 'stock' | 'crypto';
  symbol: string;
  name: string;
  tx_type: 'buy' | 'sell';
  tx_date: string;
  price: number;
  quantity: number;
  fee: number;
  notes: string;
}

export interface Holding {
  symbol: string;
  name: string;
  totalQuantity: number;
  avgCost: number;
  totalCost: number;
  currentPrice: number | null;
  currentValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPercent: number | null;
  realizedPnl: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdingCount: number;
  realizedPnl: number;
  unrealizedPnl: number | null;
}

export interface PortfolioState {
  transactions: Transaction[];
  holdings: Holding[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
}
