'use client';

import { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV, SITE, RESTRICTED_ROUTES } from '@/lib/constants';
import { useRole } from '@/hooks/useRole';
import ThemeToggle from '@/components/ui/ThemeToggle';
import styles from '@/styles/components/CardNav.module.scss';

interface CardNavItem {
  label: string;
  href: string;
  bgColor: string;
  textColor: string;
  desc?: string;
}

const RESTRICTED = new Set<string>(RESTRICTED_ROUTES);

const CARD_COLORS: { bg: string; text: string }[] = [
  { bg: '#4A7C59', text: '#FDFCF8' },   // primary green
  { bg: '#6B8F71', text: '#FDFCF8' },   // leaf green
  { bg: '#8B6F5E', text: '#FDFCF8' },   // bark
  { bg: '#C17F59', text: '#FDFCF8' },   // warm accent
];

const ITEM_DESCS: Record<string, string> = {
  '首页': '探索最新文章',
  '目录': '按标签浏览内容',
  '归档': '时光中的文字沉淀',
  '关于': '了解更多关于我',
};

export default function CardNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const role = useRole();
  const pathname = usePathname();

  const visibleNav = role === 'blogger'
    ? [...NAV]
    : NAV.filter((item) => !RESTRICTED.has(item.href));

  const items: CardNavItem[] = visibleNav.map((item, i) => ({
    label: item.label,
    href: item.href,
    bgColor: CARD_COLORS[i % CARD_COLORS.length].bg,
    textColor: CARD_COLORS[i % CARD_COLORS.length].text,
    desc: ITEM_DESCS[item.label],
  }));

  const calculateHeight = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    if (window.matchMedia('(max-width: 768px)').matches) {
      const contentEl = navEl.querySelector(`.${styles.content}`) as HTMLElement;
      if (contentEl) {
        const prev = { visibility: contentEl.style.visibility, pointerEvents: contentEl.style.pointerEvents, position: contentEl.style.position, height: contentEl.style.height };
        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';
        contentEl.offsetHeight;
        const topBar = 56;
        const padding = 16;
        const h = contentEl.scrollHeight;
        Object.assign(contentEl.style, prev);
        return topBar + h + padding;
      }
    }
    return 260;
  }, []);

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 56, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 40, opacity: 0 });

    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.35, ease: 'power3.out' });
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', stagger: 0.06 }, '-=0.08');
    return tl;
  }, [calculateHeight]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => { tl?.kill(); tlRef.current = null; };
  }, [createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        tlRef.current = createTimeline();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, createTimeline, calculateHeight]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsExpanded(true);
      tl.play(0);
    } else {
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLAnchorElement | null) => {
    cardsRef.current[i] = el;
  };

  return (
    <div className={styles.container}>
      <nav
        ref={navRef}
        className={`${styles.nav} ${isExpanded ? styles.open : ''}`}
      >
        {/* ── Top bar ── */}
        <div className={styles.top}>
          <div
            className={`${styles.hamburger} ${isExpanded ? styles.hamOpen : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? '关闭菜单' : '打开菜单'}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); } }}
          >
            <span className={styles.hamLine} />
            <span className={styles.hamLine} />
          </div>

          <Link href="/" className={styles.logo} onClick={() => { if (isExpanded) toggleMenu(); }}>
            {SITE.title}
          </Link>

          <ThemeToggle variant="subtle" />
        </div>

        {/* ── Expanded cards ── */}
        <div className={styles.content} aria-hidden={!isExpanded}>
          {items.map((item, idx) => (
            <Link
              key={`${item.label}-${idx}`}
              href={item.href}
              className={`${styles.card} ${pathname === item.href ? styles.cardActive : ''}`}
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
              onClick={() => { if (isExpanded) toggleMenu(); }}
            >
              <span className={styles.cardLabel}>{item.label}</span>
              {item.desc && <span className={styles.cardDesc}>{item.desc}</span>}
              <span className={styles.cardArrow}>→</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
