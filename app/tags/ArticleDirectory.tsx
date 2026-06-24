'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { Post } from '@/lib/posts';
import { formatDateCN } from '@/lib/utils';
import PostGrid from '@/components/post/PostGrid';
import styles from './page.module.scss';

let fuseInstance: Fuse<Post> | null = null;

function initFuse(posts: Post[]): Fuse<Post> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(posts, {
      keys: ['title', 'summary', 'tags', 'categories', 'rawContent'],
      threshold: 0.4,
      includeScore: true,
    });
  }
  return fuseInstance;
}

export default function ArticleDirectory({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fuse = initFuse(posts);
    const res = fuse.search(query.trim());
    setResults(res.map((r) => r.item));
  }, [query, posts]);

  const isSearching = query.trim().length > 0;

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>文章</h1>
        <p className={styles.subtitle}>
          共 <strong>{posts.length}</strong> 篇文章
        </p>
      </header>

      {/* Search bar */}
      <div className={styles.searchBox}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* Search results */}
      {isSearching && (
        <div>
          <p className={styles.resultHint}>
            找到 {results.length} 篇相关文章
          </p>
          {results.length > 0 ? (
            <PostGrid posts={results} />
          ) : (
            <p className={styles.emptySearch}>
              未找到匹配的文章，试试其他关键词
            </p>
          )}
        </div>
      )}

      {/* Article directory — hidden while searching */}
      {!isSearching && (
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
      )}
    </>
  );
}
