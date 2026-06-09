import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'content/posts');
const OUT_DIR = join(ROOT, 'public');

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

function normalizeArray(val) {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') return [val];
  return [];
}

const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(POSTS_DIR, f), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: data.slug ?? slugFromFilename(f),
      title: data.title ?? slugFromFilename(f),
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      summary: data.summary ?? '',
      tags: normalizeArray(data.tags),
      categories: normalizeArray(data.categories),
      img: data.img ?? null,
      rawContent: content.slice(0, 5000), // limit for search index size
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'search-data.json'), JSON.stringify(posts));

console.log(`✅ Generated search data with ${posts.length} posts`);
