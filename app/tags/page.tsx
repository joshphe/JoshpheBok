import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import ArticleDirectory from './ArticleDirectory';

export const metadata: Metadata = {
  title: '文章',
  description: '博客全部文章列表与搜索',
};

export default async function ArticlesPage() {
  const posts = await getPosts();

  return (
    <div className="container section">
      <ArticleDirectory posts={posts} />
    </div>
  );
}
