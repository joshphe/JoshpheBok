import { SITE } from '@/lib/constants';
import styles from '@/styles/components/BannerCover.module.scss';

export default function BannerCover() {
  return (
    <section className={styles.banner}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <img
          src="/images/avatar.jpg"
          alt={SITE.author}
          className={styles.avatar}
        />
        <h1 className={styles.title}>{SITE.title}</h1>
        <p className={styles.subtitle}>{SITE.subtitle}</p>
      </div>
      {/* Organic curved bottom edge */}
      <div className={styles.curve} aria-hidden="true">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60 C240 120, 480 0, 720 45 C960 90, 1200 0, 1440 60 L1440 120 L0 120 Z" fill="var(--color-bg, #FAF7F2)" />
        </svg>
      </div>
    </section>
  );
}
