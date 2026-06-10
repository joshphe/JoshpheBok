import { readdirSync } from 'fs';
import { join } from 'path';
import { SITE } from '@/lib/constants';
import { getPosts } from '@/lib/posts';
import { shuffleArray } from '@/lib/utils';
import BannerCover from '@/components/widgets/BannerCover';
import FinanceTicker from '@/components/widgets/FinanceTicker';
import WealthSection from '@/components/widgets/WealthSection';
import PostGrid from '@/components/post/PostGrid';
import styles from '@/styles/components/PostGrid.module.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: SITE.title,
};

function getBgImages(): string[] {
  const dir = join(process.cwd(), 'public/images/background');
  return readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
    .map((f) => `/images/background/${f}`);
}

export default async function HomePage() {
  const allPosts = await getPosts();

  // Pick 3 random posts at build time (Fisher-Yates)
  const picks = shuffleArray(allPosts).slice(0, 3);

  const bgImages = getBgImages();

  return (
    <>
      <div style={{ position: 'relative' }} data-hero>
        <BannerCover images={bgImages} />
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, zIndex: 2 }}>
          <FinanceTicker />
        </div>
      </div>
      <WealthSection />
      <section className={styles.homePosts}>
        <div className="container">
          <h2 className={styles.homeHeading}>推荐阅读</h2>
          <PostGrid posts={picks} />
        </div>
      </section>
    </>
  );
}
