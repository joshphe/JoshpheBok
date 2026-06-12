'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { WalletConfig } from '@/lib/chain-data';
import { usePortfolio } from './usePortfolio';
import WalletManager from './WalletManager';
import OverviewCards from './OverviewCards';
import AssetList from './AssetList';
import PortfolioChart from './PortfolioChart';
import AlertSection from './AlertSection';
import QuickActions from './QuickActions';
import styles from '@/styles/components/dashboard/AssetDashboard.module.scss';

const WealthSection = dynamic(
  () => import('@/components/widgets/WealthSection'),
  { ssr: false },
);

export default function AssetDashboard() {
  const [addresses, setAddresses] = useState<WalletConfig | null>(null);

  const {
    summary,
    assets,
    alerts,
    isLoading,
    isRefreshing,
    error,
    retry,
    lastUpdated,
    chainErrors,
  } = usePortfolio(addresses);

  const handleAddressesChange = useCallback((addrs: WalletConfig) => {
    setAddresses(addrs);
  }, []);

  // Track previous data state for transition detection
  const prevHadData = useRef(false);
  const hasData = summary != null;

  useEffect(() => {
    if (hasData) prevHadData.current = true;
  }, [hasData]);

  const hasAddresses = addresses && (addresses.eth || addresses.bnb || addresses.sol);
  const showTransition = prevHadData.current;

  // ── State: No wallets configured ──
  if (!hasAddresses && !isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              <span>📊</span>
              资产看板
              <span>📊</span>
            </h1>
          </div>

          <WalletManager
            onAddressesChange={handleAddressesChange}
            chainErrors={chainErrors}
            isRefreshing={false}
          />

          <div className={styles.emptyHint}>
            <span className={styles.emptyIcon}>👆</span>
            <p>请输入钱包地址以查看链上资产</p>
            <p className={styles.emptySub}>
              支持 Ethereum、BNB Chain、Solana 三条链
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── State: Initial loading ──
  if (isLoading && !showTransition) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>正在查询链上资产...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── State: Fatal error (no previous data to show) ──
  if (error && !showTransition) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            <div className={styles.errorIcon}>⚠️</div>
            <p className={styles.errorMsg}>{error}</p>
            <button className={styles.retryBtn} onClick={retry}>
              🔄 重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── State: Data available (or loading refresh with cached data) ──
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${showTransition ? styles.fadeIn : ''}`}>
          <h1 className={styles.title}>
            <span>📊</span>
            资产看板
            <span>📊</span>
          </h1>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              <span
                className={`${styles.dot} ${isRefreshing ? styles.live : ''}`}
              />
              最后更新：
              {lastUpdated.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
              {error && (
                <span className={styles.partialError}>
                  (部分数据获取失败)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Wallet Manager */}
        <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.05s' }}>
          <WalletManager
            onAddressesChange={handleAddressesChange}
            chainErrors={chainErrors}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Portfolio Overview Cards */}
        <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.1s' }}>
          <OverviewCards summary={summary} isLoading={isLoading} />
        </div>

        {/* Main content: Asset List + Side Panel */}
        <div className={styles.mainGrid}>
          <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.15s' }}>
            <AssetList assets={assets} isLoading={isLoading && !showTransition} />
          </div>

          <div className={styles.sidePanel}>
            <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.2s' }}>
              <PortfolioChart assets={assets} isLoading={isLoading && !showTransition} />
            </div>
            <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.25s' }}>
              <AlertSection alerts={alerts} isLoading={isLoading && !showTransition} />
            </div>
            <div className={showTransition ? styles.fadeIn : ''} style={{ animationDelay: '0.3s' }}>
              <QuickActions />
            </div>
          </div>
        </div>

        {/* Market Summary */}
        <div className={styles.marketSection}>
          <h2 className={styles.sectionTitle}>🌍 市场概览</h2>
          <WealthSection />
        </div>
      </div>
    </div>
  );
}
