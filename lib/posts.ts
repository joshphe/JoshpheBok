import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

const POSTS_DIR = join(process.cwd(), 'content/posts');

export interface Post {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  summary?: string;
  tags: string[];
  categories: string[];
  img?: string;
  toc: boolean;
  content: string;
  rawContent: string;
}

// Transform frontmatter tags/categories from string or array to array
function normalizeArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') return [val];
  return [];
}

// Generate a slug from filename (remove .md extension)
function slugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '');
}

// Process a single markdown file into a Post
async function processPost(filepath: string): Promise<Post> {
  const raw = readFileSync(filepath, 'utf-8');
  const { data, content } = matter(raw);
  const filename = filepath.split('/').pop()!;

  // Convert markdown to HTML
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { class: 'heading-anchor' },
    })
    .use(rehypePrettyCode, {
      theme: { light: 'github-light', dark: 'github-dark' },
      keepBackground: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return {
    slug: data.slug ?? slugFromFilename(filename),
    title: data.title ?? slugFromFilename(filename),
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    summary: data.summary ?? undefined,
    tags: normalizeArray(data.tags),
    categories: normalizeArray(data.categories),
    img: data.img ?? undefined,
    toc: data.toc !== false,
    content: String(processed.value),
    rawContent: content,
  };
}

// Cache for build-time processing
let _postsCache: Post[] | null = null;
let _postsBySlug: Map<string, Post> | null = null;

async function loadAllPosts(): Promise<Post[]> {
  if (_postsCache) return _postsCache;

  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = await Promise.all(
    files.map((f) => processPost(join(POSTS_DIR, f)))
  );

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  _postsCache = posts;
  _postsBySlug = new Map(posts.map((p) => [p.slug, p]));
  return posts;
}

// --- Public API ---

export async function getPosts(): Promise<Post[]> {
  return loadAllPosts();
}

export async function getPost(slug: string): Promise<Post | undefined> {
  await loadAllPosts();
  return _postsBySlug?.get(slug);
}

export async function getTags(): Promise<{ name: string; count: number }[]> {
  const posts = await loadAllPosts();
  const map = new Map<string, number>();
  posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCategories(): Promise<{ name: string; count: number }[]> {
  const posts = await loadAllPosts();
  const map = new Map<string, number>();
  posts.forEach((p) => p.categories.forEach((c) => map.set(c, (map.get(c) ?? 0) + 1)));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await loadAllPosts();
  return posts.filter((p) => p.tags.includes(tag));
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const posts = await loadAllPosts();
  return posts.filter((p) => p.categories.includes(category));
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await loadAllPosts();
  return posts.map((p) => p.slug);
}
