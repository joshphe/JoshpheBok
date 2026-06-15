'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from '@/styles/components/PostTOC.module.scss';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface PostTOCProps {
  headings: TOCItem[];
}

export default function PostTOC({ headings }: PostTOCProps) {
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible heading closest to the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    );

    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Close mobile drawer on navigation
  const handleClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  if (headings.length === 0) return null;

  return (
    <>
      {/* Desktop TOC */}
      <nav className={styles.desktop} aria-label="文章目录">
        <h4 className={styles.title}>目录导览</h4>
        <ul className={styles.list}>
          {headings.map((h) => (
            <li
              key={h.id}
              className={`${styles.item} ${styles[`lvl${h.level}`]} ${
                activeId === h.id ? styles.active : ''
              }`}
            >
              <a href={`#${h.id}`} onClick={handleClick}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile floating TOC button + drawer */}
      <div className={styles.mobile}>
        <button
          className={styles.fab}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? '关闭目录' : '打开目录'}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {mobileOpen && (
          <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
        )}

        <div className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}>
          <h4 className={styles.drawerTitle}>目录导览</h4>
          <ul className={styles.list}>
            {headings.map((h) => (
              <li
                key={h.id}
                className={`${styles.item} ${styles[`lvl${h.level}`]} ${
                  activeId === h.id ? styles.active : ''
                }`}
              >
                <a href={`#${h.id}`} onClick={handleClick}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
