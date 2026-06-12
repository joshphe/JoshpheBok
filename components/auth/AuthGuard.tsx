'use client';

import { useState, useEffect } from 'react';
import { SITE } from '@/lib/constants';
import { pickRandom } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import styles from '@/styles/components/AuthGuard.module.scss';

// All available background images
const BG_IMAGES = [
  '/images/background/bg-1.jpg',
  '/images/background/bg-2.jpg',
  '/images/background/bg-3.jpg',
];

const AUTH_KEY = 'mybok_auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'locked' | 'unlocked'>('loading');
  const [bg, setBg] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [mode, setMode] = useState<'idle' | 'blogger'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBg(pickRandom(BG_IMAGES));

    // Check existing auth: sessionStorage first, then Supabase session
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === 'guest' || saved === 'blogger') {
      setState('unlocked');
      return;
    }

    // Check Supabase session (survives tab close via cookie)
    const client = getSupabase();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          sessionStorage.setItem(AUTH_KEY, 'blogger');
          setState('unlocked');
        } else {
          setState('locked');
        }
      });
    } else {
      setState('locked');
    }
  }, []);

  const enterAsGuest = () => {
    sessionStorage.setItem(AUTH_KEY, 'guest');
    setState('unlocked');
  };

  const handleBloggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    setError('');

    const client = getSupabase();
    if (!client) {
      setError('Supabase 未配置，请联系管理员');
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? '邮箱或密码错误'
        : signInError.message);
      setIsSubmitting(false);
      return;
    }

    sessionStorage.setItem(AUTH_KEY, 'blogger');
    setState('unlocked');
  };

  // Loading — brief flash while checking sessionStorage / Supabase
  if (state === 'loading') return null;

  // Authenticated — render children normally
  if (state === 'unlocked') return <>{children}</>;

  // Locked — full-screen login overlay
  return (
    <div className={`${styles.overlay} ${bgLoaded ? styles.ready : ''}`}>
      {/* Background image */}
      {bg && (
        <img
          src={bg}
          alt=""
          className={styles.bgImage}
          fetchPriority="high"
          onLoad={() => setBgLoaded(true)}
        />
      )}

      {/* Darkening layer */}
      <div className={styles.darken} />

      {/* Login card */}
      <div className={styles.card}>
        <h1 className={styles.logo}>{SITE.title}</h1>
        <p className={styles.desc}>{SITE.subtitle}</p>

        {mode === 'idle' ? (
          <div className={styles.actions}>
            <button className={styles.guestBtn} onClick={enterAsGuest}>
              <span className={styles.btnIcon}>👁️</span>
              游客访问
            </button>
            <button className={styles.bloggerBtn} onClick={() => setMode('blogger')}>
              <span className={styles.btnIcon}>🔑</span>
              博主登录
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleBloggerSubmit}>
            <label className={styles.label}>Supabase 账号登录</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="邮箱地址"
              autoFocus
              autoComplete="email"
            />
            <input
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="密码"
              autoComplete="current-password"
            />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
              <button type="button" className={styles.backBtn} onClick={() => { setMode('idle'); setError(''); setEmail(''); setPassword(''); }}>
                ← 返回
              </button>
              <button type="submit" className={styles.submitBtn} disabled={!email.trim() || !password.trim() || isSubmitting}>
                {isSubmitting ? '登录中...' : '登录'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer hint */}
      <p className={styles.hint}>Supabase 账号登录 · 关闭标签页后需重新验证</p>
    </div>
  );
}
