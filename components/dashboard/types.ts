// ── Asset Dashboard Type Definitions ──

export interface PortfolioSummary {
  totalValueUSD: number;
  pnl24h: number;
  pnl24hPercent: number;
  unrealizedPnl: number;
  totalCostBasis: number;
  pnl7d: number | null;
  pnl7dPercent: number | null;
  lastUpdated: string; // ISO timestamp
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  costBasis: number;
  valueUSD: number;
  pnlPercent: number;
  change24hPercent: number;
  allocationPercent: number;
}

export type AlertType = 'price' | 'concentration' | 'whale' | 'gas';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string; // ISO
}

export interface DashboardData {
  summary: PortfolioSummary | null;
  assets: PortfolioAsset[];
  alerts: AlertItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  retry: () => void;
  lastUpdated: Date | null;
}
