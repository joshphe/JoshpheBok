'use client';

import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import type { Post } from '@/lib/posts';
import PostGrid from '@/components/post/PostGrid';
import styles from './page.module.scss';

let fuseInstance: Fuse<Post> | null = null;

async function initFuse(): Promise<Fuse<Post>> {
  if (fuseInstance) return fuseInstance;
  const res = await fetch('/search-data.json');
  const posts: Post[] = await res.json();
  fuseInstance = new Fuse(posts, {
    keys: ['title', 'summary', 'tags', 'categories', 'rawContent'],
    threshold: 0.4,
    includeScore: true,
  });
  return fuseInstance;
}

export default function SearchPageClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initFuse().then(() => setLoading(false));
    // Also load all posts for empty state
    fetch('/search-data.json')
      .then((r) => r.json())
      .then(setAllPosts);
  }, []);

  useEffect(() => {
    if (!fuseInstance || !query.trim()) {
      setResults([]);
      return;
    }
    const res = fuseInstance.search(query.trim());
    setResults(res.map((r) => r.item));
  }, [query]);

  return (
    <div>
      <div className={styles.searchBox}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章..."
          className={styles.input}
          autoFocus
        />
      </div>

      {query.trim() ? (
        <div>
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            找到 {results.length} 篇相关文章
          </p>
          <PostGrid posts={results} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          输入关键词搜索文章
        </p>
      )}
    </div>
  );
}
