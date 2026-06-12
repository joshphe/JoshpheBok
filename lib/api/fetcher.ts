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

/**
 * JSON-RPC call with automatic fallback across endpoints.
 * Tries each endpoint in order; returns on first success.
 */
export async function rpcCall<T = unknown>(
  endpoints: string[],
  method: string,
  params: unknown[],
  timeout = 8000,
): Promise<T> {
  const body = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params });
  let lastErr: Error | null = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { result?: T; error?: { message: string } };
      if (json.error) throw new Error(json.error.message);
      return json.result as T;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Fetcher] RPC ${url} failed:`, lastErr.message);
    }
  }
  throw lastErr ?? new Error('All RPC endpoints exhausted');
}
