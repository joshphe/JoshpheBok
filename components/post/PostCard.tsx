'use client';

import Link from 'next/link';
import type { Post } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import BorderGlow from '@/components/ui/BorderGlow';
import styles from '@/styles/components/PostCard.module.scss';

export default function PostCard({ post }: { post: Post }) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="120 35 35"
      backgroundColor="var(--color-surface, #FFFDF9)"
      borderRadius={14}
      glowRadius={30}
      glowIntensity={0.7}
      coneSpread={25}
      colors={['#4A7C59', '#8FBC8F', '#D4A76A']}
      fillOpacity={0.3}
    >
      <article className={styles.card}>
        <Link href={`/posts/${post.slug}`}>
          <div className={styles.image}>
            {post.img ? (
              <img src={post.img} alt={post.title} loading="lazy" />
            ) : (
              <div className={styles.placeholder}>
                <span>{post.title[0]}</span>
              </div>
            )}
            <span className={styles.titleOverlay}>{post.title}</span>
          </div>
        </Link>

        <div className={styles.body}>
          <p className={styles.summary}>
            {post.summary ?? post.title}
          </p>
          <div className={styles.meta}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.categories.length > 0 && (
              <span className={styles.category}>
                {post.categories[0]}
              </span>
            )}
          </div>
        </div>

        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </BorderGlow>
  );
}
