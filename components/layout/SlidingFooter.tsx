'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/constants';
import styles from '@/styles/components/SlidingFooter.module.scss';

export default function SlidingFooter() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [visible, setVisible] = useState(false);
  const touchStartY = useRef(0);

  const isAtBottom = useCallback(() => {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
  }, []);

  useEffect(() => {
    if (!isHome) return;

    let ticking = false;

    // ── Scroll: hide footer when user scrolls away from bottom ──
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!isAtBottom()) {
            setVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // ── Wheel: detect overscroll-down at bottom ──
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0 && isAtBottom()) {
        setVisible(true);
      }
    };

    // ── Touch: detect pull-up at bottom (mobile) ──
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;
      const deltaY = touchStartY.current - e.touches[0].clientY; // >0 = pulling up
      if (deltaY > 15 && isAtBottom()) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [isHome, isAtBottom]);

  const year = new Date().getFullYear();

  const content = (
    <div className={styles.inner}>
      <div className={styles.social}>
        <a href={SITE.x} target="_blank" rel="noopener noreferrer">
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          @WangHou4128
        </a>
      </div>
      <p className={styles.copy}>
        &copy; {SITE.since} &ndash; {year} {SITE.author}. Powered by Next.js.
      </p>
    </div>
  );

  // ── Inner pages: no footer ──
  if (!isHome) return null;

  // ── Homepage: sliding footer (hidden until overscroll) ──
  return (
    <footer className={`${styles.sliding} ${visible ? styles.visible : ''}`}>
      {content}
    </footer>
  );
}
