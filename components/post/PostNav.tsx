import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { getPosts } from '@/lib/posts';
import styles from '@/styles/components/PostNav.module.scss';

export default async function PostNav({ current }: { current: Post }) {
  const posts = await getPosts();
  const idx = posts.findIndex((p) => p.slug === current.slug);
  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx < posts.length - 1 ? posts[idx + 1] : null;

  return (
    <nav className={styles.nav}>
      <div className={styles.prev}>
        {prev && (
          <Link href={`/posts/${prev.slug}`}>
            <span className={styles.label}>← 上一篇</span>
            <span className={styles.linkTitle}>{prev.title}</span>
          </Link>
        )}
      </div>
      <div className={styles.next}>
        {next && (
          <Link href={`/posts/${next.slug}`}>
            <span className={styles.label}>下一篇 →</span>
            <span className={styles.linkTitle}>{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
