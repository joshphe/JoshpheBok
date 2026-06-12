'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Generic polling hook with cleanup on unmount.
 *
 * @param fn       The async function to poll (stable reference via useCallback).
 * @param interval Polling interval in ms. Defaults to 5 minutes.
 * @param opts.immediate  Whether to fire immediately on mount (default true).
 * @param opts.enabled    Whether polling is active. When false, clears the interval.
 */
export function usePolling(
  fn: () => Promise<void>,
  interval = 5 * 60 * 1000,
  opts: { immediate?: boolean; enabled?: boolean } = {},
): void {
  const { immediate = true, enabled = true } = opts;
  const cancelled = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const tick = useCallback(async () => {
    if (cancelled.current) return;
    try {
      await fnRef.current();
    } catch {
      // polling continues on error — caller handles per-call error state
    }
  }, []);

  useEffect(() => {
    cancelled.current = false;

    if (!enabled) return;

    if (immediate) {
      tick();
    }

    const id = setInterval(tick, interval);

    return () => {
      cancelled.current = true;
      clearInterval(id);
    };
  }, [tick, interval, immediate, enabled]);
}
