import type { Metadata } from 'next';
import { SITE, PROFILE } from '@/lib/constants';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '关于',
};

export default function AboutPage() {
  return (
    <div className="container section">
      <div className={styles.card}>
        <img src={PROFILE.avatar} alt={SITE.author} className={styles.avatar} />
        <h1 className={styles.name}>{SITE.author}</h1>
        <p className={styles.career}>{PROFILE.career}</p>
        <p className={styles.intro}>{PROFILE.intro}</p>

        <div className={styles.links}>
          <a href={SITE.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
            GitHub
          </a>
          <a href={`mailto:${SITE.email}`} className={styles.link}>
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
