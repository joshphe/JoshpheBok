'use client';

import { useState, useCallback } from 'react';
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

  const hasAddresses = addresses && (addresses.eth || addresses.bnb || addresses.sol);

  // ── No wallets configured — show prompt ──
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

  // ── Full-page loading ──
  if (isLoading && !summary) {
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

  // ── Fatal error ──
  if (error && !summary) {
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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
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
                <span style={{ marginLeft: 8, color: 'var(--color-accent-warm)' }}>
                  (部分数据获取失败)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Wallet Manager */}
        <WalletManager
          onAddressesChange={handleAddressesChange}
          chainErrors={chainErrors}
          isRefreshing={isRefreshing}
        />

        {/* Portfolio Overview Cards */}
        <OverviewCards summary={summary} isLoading={isLoading} />

        {/* Main content: Asset List + Side Panel */}
        <div className={styles.mainGrid}>
          <AssetList assets={assets} isLoading={isLoading} />

          <div className={styles.sidePanel}>
            <PortfolioChart assets={assets} isLoading={isLoading} />
            <AlertSection alerts={alerts} isLoading={isLoading} />
            <QuickActions />
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
