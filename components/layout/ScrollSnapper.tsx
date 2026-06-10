'use client';

import { useEffect, useRef } from 'react';

/**
 * Only snaps to the nearest full-viewport panel boundary
 * when the user has scrolled very close to it (within 8% vh).
 * Mid-panel scrolling is completely free.
 */
export default function ScrollSnapper({ children }: { children: React.ReactNode }) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const snapping = useRef(false);

  useEffect(() => {
    const THRESHOLD = 0.08; // 8% of viewport height

    const snap = (targetY: number) => {
      snapping.current = true;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      // Ignore scroll events during the smooth animation
      setTimeout(() => {
        snapping.current = false;
      }, 600);
    };

    const onScrollEnd = () => {
      if (snapping.current) return;

      const vh = window.innerHeight;
      const y = window.scrollY;
      const nearest = Math.round(y / vh);
      const targetY = nearest * vh;
      const dist = Math.abs(y - targetY);

      // Only snap when very close to a panel edge
      if (dist > 0 && dist < vh * THRESHOLD) {
        snap(targetY);
      }
    };

    const onScroll = () => {
      if (snapping.current) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(onScrollEnd, 180);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer.current);
    };
  }, []);

  return <>{children}</>;
}
