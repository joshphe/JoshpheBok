import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import { groupByYearMonth, formatDate } from '@/lib/utils';
import Link from 'next/link';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '归档',
};

export default async function ArchivesPage() {
  const posts = await getPosts();
  const groups = groupByYearMonth(posts);

  return (
    <div className="container section">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>归档</h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        共 {posts.length} 篇文章
      </p>

      {groups.map(([period, postsInPeriod]) => (
        <section key={period} className={styles.group}>
          <h2 className={styles.period}>{period}</h2>
          <ul className={styles.list}>
            {postsInPeriod.map((post) => (
              <li key={post.slug} className={styles.item}>
                <time dateTime={post.date} className={styles.date}>
                  {formatDate(post.date)}
                </time>
                <Link href={`/posts/${post.slug}`} className={styles.title}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
