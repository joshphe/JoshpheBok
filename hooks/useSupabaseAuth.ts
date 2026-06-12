'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

const AUTH_KEY = 'mybok_auth';

export interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const client = getSupabase();

  useEffect(() => {
    if (!client) {
      setIsLoading(false);
      return;
    }

    client.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        sessionStorage.setItem(AUTH_KEY, 'blogger');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!client) return { error: 'Supabase 未配置' };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message };
    }
    sessionStorage.setItem(AUTH_KEY, 'blogger');
    return { error: null };
  }, [client]);

  const signOut = useCallback(async () => {
    if (client) {
      await client.auth.signOut();
    }
    sessionStorage.removeItem(AUTH_KEY);
    setUser(null);
    setSession(null);
  }, [client]);

  return { user, session, isLoading, signIn, signOut };
}
