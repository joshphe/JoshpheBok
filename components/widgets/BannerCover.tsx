'use client';

import { useState, useEffect } from 'react';
import { SITE } from '@/lib/constants';
import styles from '@/styles/components/BannerCover.module.scss';

function pickRandom(images: string[]): string {
  return images[Math.floor(Math.random() * images.length)];
}

export default function BannerCover({ images }: { images: string[] }) {
  const [bg, setBg] = useState<string | null>(null);

  useEffect(() => {
    setBg(pickRandom(images));
  }, [images]);

  return (
    <section
      className={styles.banner}
      style={bg ? { backgroundImage: `url(${bg})` } : undefined}
    >
      <div className={styles.content}>
        <p className={styles.subtitle}>{SITE.subtitle}</p>
        <p className={styles.accent}>— explore &middot; create &middot; reflect —</p>
      </div>
    </section>
  );
}
