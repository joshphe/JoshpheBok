'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/components/ThemeToggle.module.scss';

interface Props {
  variant?: 'default' | 'subtle';
}

export default function ThemeToggle({ variant = 'default' }: Props) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferred = saved ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    setTheme(preferred);
    document.documentElement.setAttribute('data-theme', preferred);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      className={`${styles.toggle} ${variant === 'subtle' ? styles.subtle : ''}`}
      onClick={toggle}
      aria-label="切换主题"
    >
      {mounted ? (theme === 'light' ? '🌝' : '🌞') : '🌞'}
    </button>
  );
}
