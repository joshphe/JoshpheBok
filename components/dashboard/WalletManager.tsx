'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WalletConfig } from '@/lib/chain-data';
import styles from '@/styles/components/dashboard/WalletManager.module.scss';

const STORAGE_KEY = 'mybok_wallets';

interface ChainStatus {
  ok: boolean;
  pending: boolean;
  error: string | null;
}

interface Props {
  onAddressesChange: (addresses: WalletConfig) => void;
  chainErrors: Record<string, string | undefined>;
  isRefreshing: boolean;
}

function readSavedConfig(): WalletConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        eth: parsed.eth ?? '',
        bnb: parsed.bnb ?? '',
        sol: parsed.sol ?? '',
      };
    }
  } catch {
    // corrupted data
  }
  return null;
}

function saveConfig(config: WalletConfig) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export default function WalletManager({ onAddressesChange, chainErrors, isRefreshing }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [addresses, setAddresses] = useState<WalletConfig>({ eth: '', bnb: '', sol: '' });
  const [saved, setSaved] = useState(false);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const savedCfg = readSavedConfig();
    if (savedCfg) {
      setAddresses(savedCfg);
      setSaved(true);
      onAddressesChange(savedCfg);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback((chain: keyof WalletConfig, value: string) => {
    setAddresses((prev) => ({ ...prev, [chain]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const trimmed: WalletConfig = {
      eth: addresses.eth.trim(),
      bnb: addresses.bnb.trim(),
      sol: addresses.sol.trim(),
    };
    saveConfig(trimmed);
    setAddresses(trimmed);
    setSaved(true);
    setExpanded(false);
    onAddressesChange(trimmed);
  }, [addresses, onAddressesChange]);

  const handleClear = useCallback(() => {
    const empty: WalletConfig = { eth: '', bnb: '', sol: '' };
    setAddresses(empty);
    setSaved(false);
    sessionStorage.removeItem(STORAGE_KEY);
    onAddressesChange(empty);
  }, [onAddressesChange]);

  const hasAnyAddress = addresses.eth || addresses.bnb || addresses.sol;

  const getStatus = (chain: keyof WalletConfig): ChainStatus => {
    const err = chainErrors[chain];
    if (err) return { ok: false, pending: false, error: err };
    if (isRefreshing && !saved) return { ok: false, pending: true, error: null };
    if (saved && (addresses[chain])) return { ok: true, pending: false, error: null };
    return { ok: false, pending: false, error: null };
  };

  // Collapsed state — show address summary
  if (!expanded && saved) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            <span>🔗</span> 钱包资产
          </h3>
          <button className={styles.toggleBtn} onClick={() => setExpanded(true)}>
            编辑
          </button>
        </div>
        <div className={styles.summary}>
          {(['eth', 'bnb', 'sol'] as const).map((chain) => {
            const addr = addresses[chain];
            if (!addr) return null;
            const status = getStatus(chain);
            return (
              <span key={chain} className={styles.chainBadge}>
                <span
                  className={`${styles.statusDot} ${
                    status.ok ? styles.ok : status.error ? styles.error : ''
                  }`}
                />
                {chain.toUpperCase()}
                <span className={styles.addr}>
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span>🔗</span> 钱包地址
        </h3>
        {saved && (
          <button className={styles.toggleBtn} onClick={() => setExpanded(false)}>
            收起
          </button>
        )}
      </div>

      <div className={styles.form}>
        {(['eth', 'bnb', 'sol'] as const).map((chain) => {
          const status = getStatus(chain);
          const icons: Record<string, string> = { eth: '💎', bnb: '🟡', sol: '🟣' };
          const names: Record<string, string> = { eth: 'Ethereum', bnb: 'BNB Chain', sol: 'Solana' };
          const placeholders: Record<string, string> = {
            eth: '0x...',
            bnb: '0x...',
            sol: '输入 Solana 地址...',
          };

          return (
            <div key={chain} className={styles.field}>
              <label className={styles.label}>
                <span className={styles.chainIcon}>{icons[chain]}</span>
                <span className={styles.chainName}>{names[chain]}</span>
                <span
                  className={`${styles.statusDot} ${
                    status.ok ? styles.ok : status.pending ? styles.pending : status.error ? styles.error : ''
                  }`}
                />
              </label>
              <input
                type="text"
                className={`${styles.input} ${status.error ? styles.error : ''}`}
                placeholder={placeholders[chain]}
                value={addresses[chain]}
                onChange={(e) => handleChange(chain, e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
              {status.error && (
                <span className={styles.errorText}>{status.error}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        {saved && (
          <button className={styles.clearBtn} onClick={handleClear}>
            清除
          </button>
        )}
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!hasAnyAddress}
        >
          💾 保存并查询
        </button>
      </div>
    </div>
  );
}
