import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/lib/posts';
import { formatDateCN } from '@/lib/utils';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '文章目录',
  description: '博客全部文章列表',
};

export default async function DirectoryPage() {
  const posts = await getPosts();

  return (
    <div className="container section">
      <header className={styles.header}>
        <h1 className={styles.title}>文章目录</h1>
        <p className={styles.subtitle}>
          共 <strong>{posts.length}</strong> 篇文章
        </p>
      </header>

      <div className={styles.list}>
        {posts.map((post, idx) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className={styles.item}
          >
            <span className={styles.index}>
              {String(idx + 1).padStart(2, '0')}
            </span>

            <div className={styles.body}>
              <div className={styles.topRow}>
                <span className={styles.link}>{post.title}</span>
                {post.categories[0] && (
                  <span className={styles.category}>{post.categories[0]}</span>
                )}
              </div>
              <div className={styles.meta}>
                <time dateTime={post.date}>{formatDateCN(post.date)}</time>
                {post.summary && (
                  <span className={styles.excerpt}>{post.summary}</span>
                )}
              </div>
            </div>

            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
