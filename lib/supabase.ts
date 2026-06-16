import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Supabase SDK sends anonymous telemetry to its /events endpoint.
 * That endpoint may not return CORS headers for all origins, causing
 * benign (but noisy) browser warnings. This wrapper silently drops
 * those requests so they never hit the network.
 */
function suppressTelemetryFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Intercept Supabase telemetry events that lack CORS headers
  if (url.includes('/events') && url.includes('client_id')) {
    return Promise.resolve(new Response(null, { status: 200 }));
  }

  return fetch(input, init);
}

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null; // SSR guard for static export

  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local');
    return null;
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: suppressTelemetryFetch,
    },
  });

  return _client;
}
