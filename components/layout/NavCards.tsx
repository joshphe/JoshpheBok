'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, RESTRICTED_ROUTES } from '@/lib/constants';
import { useRole } from '@/hooks/useRole';
import styles from '@/styles/components/NavCards.module.scss';

const RESTRICTED = new Set<string>(RESTRICTED_ROUTES);

const CARD_COLORS: { bg: string; text: string }[] = [
  { bg: 'rgba(74,124,89,0.55)', text: '#FDFCF8' },
  { bg: 'rgba(107,143,113,0.55)', text: '#FDFCF8' },
  { bg: 'rgba(139,111,94,0.55)', text: '#FDFCF8' },
  { bg: 'rgba(193,127,89,0.55)', text: '#FDFCF8' },
];

const ICONS: Record<string, string> = {
  '首页': '🏠',
  '目录': '📂',
  '归档': '📦',
  '关于': '✨',
};

export default function NavCards() {
  const role = useRole();
  const pathname = usePathname();

  const visibleNav = role === 'blogger'
    ? [...NAV]
    : NAV.filter((item) => !RESTRICTED.has(item.href));

  return (
    <div className={styles.strip}>
      {visibleNav.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.card} ${pathname === item.href ? styles.active : ''} ${item.href === '/' ? styles.homeCard : ''}`}
          style={{
            backgroundColor: CARD_COLORS[i % CARD_COLORS.length].bg,
            color: CARD_COLORS[i % CARD_COLORS.length].text,
          }}
        >
          <span className={styles.icon}>{ICONS[item.label] ?? ''}</span>
          <span className={styles.label}>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
