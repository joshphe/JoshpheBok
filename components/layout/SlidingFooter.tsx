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
        <a href={SITE.github} target="_blank" rel="noopener noreferrer">
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.01 12.01 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
      <p className={styles.copy}>
        &copy; {SITE.since} &ndash; {year} {SITE.author}. Powered by Next.js.
      </p>
    </div>
  );

  // ── Inner pages: normal static footer ──
  if (!isHome) {
    return (
      <footer className={styles.static}>
        {content}
      </footer>
    );
  }

  // ── Homepage: sliding footer (hidden until overscroll) ──
  return (
    <footer className={`${styles.sliding} ${visible ? styles.visible : ''}`}>
      {content}
    </footer>
  );
}
