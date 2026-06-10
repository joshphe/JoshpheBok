import type { IndexItem, CryptoItem } from '@/lib/market-data';
import styles from '@/styles/components/MarketCard.module.scss';

function fmtPrice(p: number | null, isCrypto = false): string {
  if (p == null) return '—';
  if (isCrypto) {
    if (p >= 1000) return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return '$' + p.toFixed(2);
    return '$' + p.toPrecision(4);
  }
  // Indices
  return p.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChange(amount: number | null, percent: number | null): { text: string; up: boolean; down: boolean } {
  if (amount == null && percent == null) return { text: '—', up: false, down: false };
  const pct = percent != null ? `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%` : '';
  const amt = amount != null ? `${amount > 0 ? '+' : ''}${amount.toFixed(2)}` : '';
  const text = [amt, pct].filter(Boolean).join('  ');
  const up = (percent ?? amount ?? 0) > 0;
  const down = (percent ?? amount ?? 0) < 0;
  return { text, up, down };
}

function IndexRow({ item, isCrypto = false }: { item: IndexItem | CryptoItem; isCrypto?: boolean }) {
  const price = fmtPrice(item.price, isCrypto);
  const change = 'changePercent' in item
    ? fmtChange(null, (item as CryptoItem | IndexItem).changePercent as number | null)
    : fmtChange((item as IndexItem).changeAmount, (item as IndexItem).changePercent);

  return (
    <div className={styles.row}>
      <span className={styles.name}>{item.name}</span>
      <span className={styles.price}>{price}</span>
      <span className={`${styles.change} ${change.up ? styles.up : ''} ${change.down ? styles.down : ''}`}>
        {change.text}
      </span>
    </div>
  );
}

interface MarketCardProps {
  title: string;
  subtitle: string;
  items: (IndexItem | CryptoItem)[];
  isCrypto?: boolean;
}

export default function MarketCard({ title, subtitle, items, isCrypto = false }: MarketCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
      <div className={styles.body}>
        {items.map((item, i) => (
          <IndexRow key={i} item={item} isCrypto={isCrypto} />
        ))}
      </div>
    </div>
  );
}
