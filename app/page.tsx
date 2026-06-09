import { SITE } from '@/lib/constants';
import BannerCover from '@/components/widgets/BannerCover';
import DreamQuote from '@/components/widgets/DreamQuote';
import FinanceTicker from '@/components/widgets/FinanceTicker';
import PostGrid from '@/components/post/PostGrid';
import { getPosts } from '@/lib/posts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: SITE.title,
};

export default async function HomePage() {
  const allPosts = await getPosts();

  // Pick 3 random posts at build time
  const shuffled = [...allPosts].sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 3);

  return (
    <>
      <BannerCover />
      <DreamQuote />
      <FinanceTicker />
      <section className="section">
        <div className="container">
          <PostGrid posts={picks} />
        </div>
      </section>
      {/* prevents fixed ticker from covering footer text */}
      <div style={{ height: '4rem' }} aria-hidden="true" />
    </>
  );
}
