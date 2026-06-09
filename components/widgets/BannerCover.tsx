'use client';

import { useState, useEffect, useCallback } from 'react';
import { SITE } from '@/lib/constants';
import styles from '@/styles/components/BannerCover.module.scss';

function pickRandom(images: string[]): string {
  return images[Math.floor(Math.random() * images.length)];
}

export default function BannerCover({ images }: { images: string[] }) {
  const [bg, setBg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setBg(pickRandom(images));
  }, [images]);

  const onLoad = useCallback(() => setLoaded(true), []);

  return (
    <section className={`${styles.banner} ${loaded ? styles.ready : ''}`}>
      {bg && (
        <img
          src={bg}
          alt=""
          className={styles.bgImage}
          fetchPriority="high"
          onLoad={onLoad}
        />
      )}
      <div className={styles.content}>
        <p className={styles.subtitle}>{SITE.subtitle}</p>
        <p className={styles.accent}>— explore &middot; create &middot; reflect —</p>
      </div>
    </section>
  );
}
