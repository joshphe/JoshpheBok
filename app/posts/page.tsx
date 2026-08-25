import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import PostGrid from '@/components/post/PostGrid';

export const metadata: Metadata = {
  title: '文章',
};

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="container section">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>文章</h1>
      <PostGrid posts={posts} />
    </div>
  );
}
