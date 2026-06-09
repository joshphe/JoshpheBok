import type { Metadata } from 'next';
import { getPosts } from '@/lib/posts';
import { PER_PAGE } from '@/lib/constants';
import PostGrid from '@/components/post/PostGrid';
import Pagination from '@/components/ui/Pagination';

export const metadata: Metadata = {
  title: '文章',
};

export default async function PostsPage() {
  const allPosts = await getPosts();
  const totalPages = Math.ceil(allPosts.length / PER_PAGE);
  const pagePosts = allPosts.slice(0, PER_PAGE);

  return (
    <div className="container section">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>文章</h1>
      <PostGrid posts={pagePosts} />
      {totalPages > 1 && <Pagination current={1} total={totalPages} basePath="/posts" />}
    </div>
  );
}
