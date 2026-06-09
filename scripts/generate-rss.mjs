import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'content/posts');
const OUT_DIR = join(ROOT, 'public');

const SITE = {
  title: '暮光之城',
  url: 'https://joshphe.top',
  description: '一个专注数据库技术与后端开发的个人博客',
  author: 'JinPeng Wang',
};

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(POSTS_DIR, f), 'utf-8');
    const { data, content } = matter(raw);
    const slug = data.slug ?? slugFromFilename(f);
    return {
      title: data.title ?? slug,
      slug,
      date: data.date ? new Date(data.date) : new Date(),
      summary: data.summary ?? '',
    };
  })
  .sort((a, b) => b.date.getTime() - a.date.getTime());

const items = posts.map((p) => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE.url}/posts/${p.slug}</link>
      <guid>${SITE.url}/posts/${p.slug}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${escapeXml(p.summary)}</description>
    </item>`).join('');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'feed.xml'), rss);
console.log('✅ RSS feed generated');
