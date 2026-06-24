import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'content/posts');
const OUT_DIR = join(ROOT, 'public');

const SITE_URL = 'https://joshphe.xyz';

function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}

// Static pages
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/posts', priority: '0.9', changefreq: 'daily' },
  { path: '/tags', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
];

// Collect post pages
const posts = readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const raw = readFileSync(join(POSTS_DIR, f), 'utf-8');
    const { data } = matter(raw);
    const slug = data.slug ?? slugFromFilename(f);
    return {
      slug,
      date: data.date ? new Date(data.date) : new Date(),
    };
  });


const urls = [
  ...staticPages.map((p) => ({
    loc: `${SITE_URL}${p.path}`,
    priority: p.priority,
    changefreq: p.changefreq,
  })),
  ...posts.map((p) => ({
    loc: `${SITE_URL}/posts/${p.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: p.date.toISOString().split('T')[0],
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated with ${urls.length} URLs`);
