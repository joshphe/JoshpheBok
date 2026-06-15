'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Transaction, TransactionInput } from './types';
import { searchStocks, searchCrypto } from './searchSymbol';
import styles from '@/styles/components/portfolio/Portfolio.module.scss';

interface Suggestion {
  symbol: string;
  name: string;
}

interface Props {
  assetType?: 'stock' | 'crypto';
  editTransaction?: Transaction | null;
  /** Pre-fill symbol/name/assetType when adding a transaction for a specific asset */
  prefill?: { assetType?: 'stock' | 'crypto'; symbol?: string; name?: string } | null;
  onSave: (input: TransactionInput) => Promise<void>;
  onClose: () => void;
}

export default function AddTransactionModal({ assetType: initialType, editTransaction, prefill, onSave, onClose }: Props) {
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>(initialType ?? 'stock');
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [txType, setTxType] = useState<'buy' | 'sell'>('buy');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityMode, setQuantityMode] = useState<'qty' | 'total'>('qty');
  const [totalPrice, setTotalPrice] = useState('');
  const [fee, setFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Symbol search
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const symbolInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editTransaction;

  useEffect(() => {
    if (editTransaction) {
      setAssetType(editTransaction.asset_type);
      setSymbol(editTransaction.symbol);
      setName(editTransaction.name);
      setTxType(editTransaction.tx_type);
      setTxDate(editTransaction.tx_date);
      setPrice(String(editTransaction.price));
      setQuantity(String(editTransaction.quantity));
      setFee(String(editTransaction.fee));
      setNotes(editTransaction.notes);
    }
  }, [editTransaction]);

  // Pre-fill symbol/name/assetType when adding from detail modal
  useEffect(() => {
    if (editTransaction) return; // edit mode takes precedence
    if (prefill) {
      if (prefill.assetType) setAssetType(prefill.assetType);
      if (prefill.symbol) setSymbol(prefill.symbol);
      if (prefill.name) setName(prefill.name);
    }
  }, [prefill, editTransaction]);

  // Reset search when asset type changes (unless editing)
  useEffect(() => {
    if (!isEdit) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [assetType, isEdit]);

  const handleSymbolChange = useCallback((value: string) => {
    setSymbol(value);
    setSelectedIdx(-1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      if (assetType === 'stock') {
        const results = searchStocks(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setIsSearching(true);
        const results = await searchCrypto(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsSearching(false);
      }
    }, assetType === 'stock' ? 100 : 300);
  }, [assetType]);

  const selectSuggestion = useCallback((s: Suggestion) => {
    setSymbol(s.symbol);
    setName(s.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIdx(-1);
  }, []);

  const handleSymbolKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((p) => Math.min(p + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((p) => Math.max(p - 1, -1)); }
    else if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); selectSuggestion(suggestions[selectedIdx]); }
    else if (e.key === 'Escape') { setShowSuggestions(false); setSelectedIdx(-1); }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (symbolInputRef.current && !symbolInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!symbol.trim()) { setError('请输入代码'); return; }
    const priceNum = parseFloat(price);
    const qtyNum = parseFloat(quantity);
    if (isNaN(priceNum) || priceNum <= 0) { setError('请输入有效价格'); return; }
    if (isNaN(qtyNum) || qtyNum <= 0) { setError('请输入有效数量'); return; }

    const input: TransactionInput = {
      asset_type: assetType,
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || symbol.trim().toUpperCase(),
      tx_type: txType,
      tx_date: txDate,
      price: priceNum,
      quantity: qtyNum,
      fee: parseFloat(fee) || 0,
      notes: notes.trim(),
    };

    setIsSaving(true);
    try { await onSave(input); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : '保存失败'); }
    finally { setIsSaving(false); }
  };

  // When in "total price" mode, auto-calculate quantity from totalPrice / price
  useEffect(() => {
    if (quantityMode !== 'total') return;
    const priceNum = parseFloat(price);
    const totalNum = parseFloat(totalPrice);
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(totalNum) && totalNum > 0) {
      setQuantity((totalNum / priceNum).toFixed(8));
    } else {
      setQuantity('');
    }
  }, [quantityMode, price, totalPrice]);

  const qtyUnit = assetType === 'stock' ? '股' : '个';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {isEdit ? '编辑交易记录' : '添加交易'}
          </h3>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {/* Asset type selector */}
          <div className={styles.assetTypeRow}>
            <label className={styles.formLabel}>资产分类</label>
            <div className={styles.assetTypeToggle}>
              <button
                type="button"
                className={`${styles.assetTypeBtn} ${assetType === 'stock' ? styles.assetTypeActive : ''}`}
                onClick={() => setAssetType('stock')}
              >
                美股
              </button>
              <button
                type="button"
                className={`${styles.assetTypeBtn} ${assetType === 'crypto' ? styles.assetTypeActive : ''}`}
                onClick={() => setAssetType('crypto')}
              >
                虚拟货币
              </button>
            </div>
          </div>

          {/* Buy/Sell toggle */}
          <div className={styles.txTypeToggle}>
            <button type="button" className={`${styles.txTypeBtn} ${txType === 'buy' ? styles.txTypeActive : ''}`} onClick={() => setTxType('buy')}>买入</button>
            <button type="button" className={`${styles.txTypeBtn} ${txType === 'sell' ? styles.txTypeActive : ''}`} onClick={() => setTxType('sell')}>卖出</button>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>代码 *</label>
              <div className={styles.symbolSearchWrap}>
                <input ref={symbolInputRef} className={styles.formInput} value={symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  onKeyDown={handleSymbolKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder={assetType === 'stock' ? '输入代码搜索，如 AAPL' : '输入代码搜索，如 BTC'}
                  autoComplete="off"
                />
                {isSearching && <span className={styles.searchSpinner} />}
                {showSuggestions && suggestions.length > 0 && (
                  <ul className={styles.suggestions}>
                    {suggestions.map((s, i) => (
                      <li key={s.symbol}
                        className={`${styles.suggestionItem} ${i === selectedIdx ? styles.suggestionActive : ''}`}
                        onMouseDown={() => selectSuggestion(s)}
                      >
                        <span className={styles.suggestionSymbol}>{s.symbol}</span>
                        <span className={styles.suggestionName}>{s.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>名称</label>
              <input className={styles.formInput} value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={assetType === 'stock' ? 'Apple Inc.' : 'Bitcoin'}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>日期</label>
              <input type="date" className={styles.formInput} value={txDate} onChange={(e) => setTxDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>价格 *</label>
              <input type="number" step="any" className={styles.formInput} value={price}
                onChange={(e) => setPrice(e.target.value)} placeholder="150.00" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>
                {quantityMode === 'qty' ? `数量 * (${qtyUnit})` : '购买总价 *'}
                <span className={styles.qtyModeToggle}>
                  <button
                    type="button"
                    className={`${styles.qtyModeBtn} ${quantityMode === 'qty' ? styles.qtyModeActive : ''}`}
                    onClick={() => { setQuantityMode('qty'); setTotalPrice(''); }}
                  >
                    数量
                  </button>
                  <button
                    type="button"
                    className={`${styles.qtyModeBtn} ${quantityMode === 'total' ? styles.qtyModeActive : ''}`}
                    onClick={() => { setQuantityMode('total'); setQuantity(''); }}
                  >
                    总价
                  </button>
                </span>
              </label>
              {quantityMode === 'qty' ? (
                <input type="number" step="any" className={styles.formInput} value={quantity}
                  onChange={(e) => setQuantity(e.target.value)} placeholder="10" />
              ) : (
                <>
                  <input type="number" step="any" className={styles.formInput} value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)} placeholder="1500.00" />
                  {quantity && parseFloat(quantity) > 0 && (
                    <span className={styles.qtyHint}>
                      ≈ {parseFloat(quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })} {qtyUnit}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>手续费</label>
              <input type="number" step="any" className={styles.formInput} value={fee}
                onChange={(e) => setFee(e.target.value)} placeholder="0" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>备注</label>
              <input className={styles.formInput} value={notes}
                onChange={(e) => setNotes(e.target.value)} placeholder="可选" />
            </div>
          </div>

          {error && <p className={styles.formError}>{error}</p>}

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
