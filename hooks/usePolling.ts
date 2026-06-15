'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Generic polling hook with cleanup on unmount.
 *
 * @param fn       The async function to poll (stable reference via useCallback).
 *                 Receives an AbortSignal that is aborted on unmount.
 * @param interval Polling interval in ms. Defaults to 5 minutes.
 * @param opts.immediate  Whether to fire immediately on mount (default true).
 * @param opts.enabled    Whether polling is active. When false, clears the interval.
 */
export function usePolling(
  fn: (signal: AbortSignal) => Promise<void>,
  interval = 5 * 60 * 1000,
  opts: { immediate?: boolean; enabled?: boolean } = {},
): void {
  const { immediate = true, enabled = true } = opts;
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = async () => {
      if (controller.signal.aborted) return;
      try {
        await fnRef.current(controller.signal);
      } catch {
        // polling continues on error — caller handles per-call error state
      }
    };

    if (immediate) {
      tick();
    }

    timer = setInterval(tick, interval);

    return () => {
      controller.abort();
      if (timer !== null) clearInterval(timer);
    };
  }, [interval, immediate, enabled]);
}
