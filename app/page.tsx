import { readdirSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { SITE } from '@/lib/constants';
import { getPosts } from '@/lib/posts';
import { shuffleArray } from '@/lib/utils';
import BannerCover from '@/components/widgets/BannerCover';
import WealthSection from '@/components/widgets/WealthSection';
import PostGrid from '@/components/post/PostGrid';
import ScrollSnapper from '@/components/layout/ScrollSnapper';
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
    <ScrollSnapper>
      <div style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 1, overflow: 'hidden' }} data-hero>
        <BannerCover images={bgImages} />
      </div>
      <WealthSection />
      <section className={styles.homePosts}>
        <div className="container">
          <h2 className={styles.homeHeading}>推荐阅读</h2>
          <PostGrid posts={picks} />
          <div className={styles.moreWrap}>
            <Link href="/posts" className={styles.moreBtn}>
              查看更多 →
            </Link>
          </div>
        </div>
      </section>
    </ScrollSnapper>
  );
}
