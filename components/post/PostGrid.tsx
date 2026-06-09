import type { Post } from '@/lib/posts';
import PostCard from '@/components/post/PostCard';
import styles from '@/styles/components/PostGrid.module.scss';

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className={styles.empty}>暂无文章</p>;
  }

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
