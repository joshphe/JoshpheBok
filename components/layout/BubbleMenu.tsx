'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, SITE } from '@/lib/constants';
import { getSupabase } from '@/lib/supabase';
import styles from '@/styles/components/BubbleMenu.module.scss';

export default function BubbleMenu() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleExit = useCallback(async () => {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    sessionStorage.removeItem('mybok_auth');
    window.location.reload();
  }, []);

  return (
    <nav className={`${styles.nav} ${isHome ? styles.onHero : ''}`}>
      {/* Logo */}
      <Link href="/" className={styles.logo} prefetch={false}>
        <span className={styles.logoText}>{SITE.title}</span>
      </Link>

      {/* Nav links */}
      <div className={styles.links}>
        {NAV.filter((item) => item.href !== '/').map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`${styles.link} ${pathname === item.href ? styles.linkActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Exit button */}
      <button className={styles.exitBtn} onClick={handleExit} title="退出登录">
        退出
      </button>
    </nav>
  );
}
