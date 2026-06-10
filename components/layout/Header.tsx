'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV, SITE, RESTRICTED_ROUTES } from '@/lib/constants';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useRole } from '@/hooks/useRole';
import styles from '@/styles/components/Header.module.scss';

const RESTRICTED = new Set<string>(RESTRICTED_ROUTES);

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = useRole();

  const visibleNav = role === 'blogger' ? NAV : NAV.filter((item) => !RESTRICTED.has(item.href));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {SITE.title}
        </Link>

        <nav className={styles.desktopNav}>
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="菜单"
          >
            <span className={`${styles.hamburger} ${mobileOpen ? styles.open : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      <div className={`${styles.mobileNav} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {visibleNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
