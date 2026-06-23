// ── Shared HTTP Fetcher with Timeout ──
// Used by all API modules. Single source of truth for fetch behavior.

const DEFAULT_TIMEOUT = 8000;

export interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Fetch JSON with AbortController timeout.
 * Returns parsed JSON — throws on HTTP error, timeout, or parse failure.
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, headers } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

