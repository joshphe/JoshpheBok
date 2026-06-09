import type { Post } from '@/lib/posts';
import { formatDateCN } from '@/lib/utils';
import Link from 'next/link';
import styles from '@/styles/components/PostDetail.module.scss';

export default function PostDetail({ post }: { post: Post }) {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <time dateTime={post.date}>{formatDateCN(post.date)}</time>
          {post.categories.length > 0 && (
            <Link href={`/categories/${post.categories[0]}`} className={styles.category}>
              {post.categories[0]}
            </Link>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} className={styles.tag}>
                # {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
