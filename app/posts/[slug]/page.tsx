import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPost, getAllSlugs } from '@/lib/posts';
import { SITE } from '@/lib/constants';
import PostDetail from '@/components/post/PostDetail';
import PostTOC from '@/components/post/PostTOC';
import PostNav from '@/components/post/PostNav';
import PageGuard from '@/components/auth/PageGuard';
import styles from './page.module.scss';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: '文章未找到' };
  return {
    title: post.title,
    description: post.summary ?? post.title,
    keywords: post.tags,
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.summary ?? post.title,
      url: `${SITE.url}/posts/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags,
    },
  };
}

function extractHeadings(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, '').trim();
    headings.push({ id: match[2], text, level: parseInt(match[1]) });
  }
  return headings;
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);

  return (
    <PageGuard>
      <div className={styles.page}>
        <div className={styles.content}>
          <PostDetail post={post} />
          <PostNav current={post} />
        </div>
        <aside className={styles.sidebar}>
          <PostTOC headings={headings} />
        </aside>
      </div>
    </PageGuard>
  );
}
