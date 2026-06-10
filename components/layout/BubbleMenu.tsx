'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, SITE } from '@/lib/constants';
import styles from '@/styles/components/BubbleMenu.module.scss';

export default function BubbleMenu() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className={`${styles.nav} ${isHome ? styles.onHero : ''}`}>
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoText}>{SITE.title}</span>
      </Link>

      {/* Nav links */}
      <div className={styles.links}>
        {NAV.filter((item) => item.href !== '/').map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.link} ${pathname === item.href ? styles.linkActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
