'use client';

import { useState, useEffect } from 'react';
import { SITE } from '@/lib/constants';
import styles from '@/styles/components/AuthGuard.module.scss';

// SHA-256 hash of the token — no plaintext in source
const TOKEN_HASH = '2e3ddecefd23265ae6ee9af3d374df6087a2678c35bfeadaeab9de2151072114';

// All available background images
const BG_IMAGES = [
  '/images/background/banner-bg.jpg',
  '/images/background/bg-1.jpg',
  '/images/background/bg-2.jpg',
  '/images/background/bg-3.jpg',
];

const AUTH_KEY = 'mybok_auth';

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'locked' | 'unlocked'>('loading');
  const [bg, setBg] = useState<string | null>(null);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [mode, setMode] = useState<'idle' | 'blogger'>('idle');
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setBg(pickRandom(BG_IMAGES));
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === 'guest' || saved === 'blogger') {
      setState('unlocked');
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
    const h = await sha256(token);
    if (h === TOKEN_HASH) {
      sessionStorage.setItem(AUTH_KEY, 'blogger');
      setState('unlocked');
    } else {
      setError(true);
      setToken('');
    }
  };

  // Loading — brief flash while checking sessionStorage
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
            <label className={styles.label}>请输入访问令牌</label>
            <input
              type="password"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(false); }}
              placeholder="输入令牌..."
              autoFocus
            />
            {error && <p className={styles.error}>令牌错误，请重试</p>}
            <div className={styles.formActions}>
              <button type="button" className={styles.backBtn} onClick={() => { setMode('idle'); setError(false); setToken(''); }}>
                ← 返回
              </button>
              <button type="submit" className={styles.submitBtn} disabled={!token.trim()}>
                验证
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Footer hint */}
      <p className={styles.hint}>关闭标签页后需重新验证</p>
    </div>
  );
}
