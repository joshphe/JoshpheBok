# MyBok — Blog Rewrite Progress

## Project Overview

- **From**: Hexo (matery theme) → **To**: Next.js 14 + Vercel static export
- **Location**: `/Users/0xjasper/Documents/MyBok`
- **Content**: 10 Chinese tech articles (database/backend focused)
- **Design**: Organic Biophilic (forest green + earth tones + organic curves)
- **Target domain**: joshphe.top

---

## Current State

### Project Structure

```
MyBok/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, Header/Footer/BackToTop)
│   ├── page.tsx                  # Homepage: Banner → DreamQuote → FinanceTicker → 3 random PostCards
│   ├── not-found.tsx             # 404 page
│   ├── about/page.tsx            # About page
│   ├── archives/page.tsx         # Archive by year
│   ├── posts/
│   │   ├── page.tsx              # Post list (paginated)
│   │   └── [slug]/page.tsx       # Post detail + TOC sidebar
│   ├── search/page.tsx           # Client-side search (fuse.js)
│   └── tags/page.tsx             # Article directory (flat, sorted by date — NOT grouped by tag)
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Sticky header with glassmorphism
│   │   ├── Footer.tsx            # Footer with GitHub icon link
│   ├── post/
│   │   ├── PostCard.tsx          # Post card with BorderGlow effect
│   │   ├── PostDetail.tsx        # Article body renderer
│   │   ├── PostGrid.tsx          # CSS Grid (1→2→3 columns)
│   │   ├── PostNav.tsx           # Prev/Next navigation
│   │   └── PostTOC.tsx           # Table of contents (desktop sidebar + mobile drawer)
│   ├── ui/
│   │   ├── BackToTop.tsx         # Scroll-to-top button
│   │   ├── BorderGlow.tsx        # Pointer-tracking glow effect on cards
│   │   ├── BorderGlow.css        # BorderGlow styles (simplified, ~6 GPU layers)
│   │   ├── Pagination.tsx        # Page navigation
│   │   └── ThemeToggle.tsx       # Dark mode toggle
│   └── widgets/
│       ├── BannerCover.tsx       # Hero section (avatar + title + subtitle, NO GitHub button)
│       ├── DreamQuote.tsx        # Tagore quote (NO leaf emoji)
│       ├── FinanceTicker.tsx     # Marquee: BTC, ETH, BNB, NVDA, AAPL, GOOGL prices
│       ├── CategoryList.tsx      # EXISTING BUT UNUSED (categories page removed)
│       └── TagCloud.tsx          # EXISTING BUT UNUSED (tags page repurposed as directory)
├── content/posts/                # 10 markdown articles (all with ASCII slugs, categories, tags)
├── data/
│   ├── friends.json              # EXISTING BUT UNUSED (friends page removed)
│   └── musics.json               # UNUSED
├── lib/
│   ├── constants.ts              # SITE metadata, NAV, PROFILE
│   ├── posts.ts                  # gray-matter + unified/rehype pipeline, cached data access
│   └── utils.ts                  # Date formatting, URL helpers
├── scripts/
│   ├── generate-search-data.mjs  # Prebuild: extracts search index → public/search-data.json
│   ├── generate-rss.mjs          # Prebuild: generates public/feed.xml
│   └── generate-sitemap.mjs      # Prebuild: generates public/sitemap.xml
├── styles/
│   ├── variables.scss            # Design tokens (colors, fonts, spacing, shadows, radii)
│   ├── mixins.scss               # card-organic, flex-center, text-truncate, breakpoints
│   ├── globals.scss              # CSS custom properties, reset, paper texture
│   └── components/               # Per-component SCSS modules (one .module.scss per component)
├── public/
│   ├── images/avatar.jpg
│   ├── favicon.png
│   ├── feed.xml                  # Generated at build
│   ├── search-data.json          # Generated at build
│   └── sitemap.xml               # Generated at build
├── next.config.mjs               # output: 'export', images.unoptimized
├── vercel.json                   # framework: nextjs, outputDirectory: out
├── package.json                  # Next.js 14.2, React 18, gray-matter, unified/rehype, shiki, fuse.js, sass
└── tsconfig.json
```

### Routes (19 static pages)

| Route | Description |
|-------|-------------|
| `/` | Homepage (Banner + DreamQuote + FinanceTicker + 3 random PostCards) |
| `/posts` | Post list (paginated, 6/page) |
| `/posts/[slug]` | Post detail with TOC sidebar (10 pages) |
| `/tags` | Article directory (flat list by date, NOT tag cloud) |
| `/archives` | Archive grouped by year |
| `/about` | About page |
| `/search` | Client-side search (fuse.js) |
| `/_not-found` | Custom 404 |
| `/feed.xml` | RSS 2.0 feed |
| `/sitemap.xml` | Sitemap |

### Deleted Routes

- `/categories`, `/categories/[category]` — removed
- `/tags/[tag]` — removed (tags page now a flat directory)
- `/friends` — removed
- `/page/[n]`, `/posts/page/[n]` — pagination removed (home shows 3 random, posts page does pagination inline)

---

## Key Decisions

### Design System
- **Palette**: Forest green `#4A7C59` primary, warm terracotta `#C17F59` accent, parchment `#FAF7F2` background
- **Typography**: Cormorant Garamond (headings), Noto Sans SC (body), Noto Serif SC (serif fallback)
- **Cards**: `card-organic` mixin — surface bg, 1px border, `border-radius: 14px`, soft shadow, paper grain `::after`
- **Font loading**: `display=optional` (no layout shift, no FOUT penalty)
- **Performance**: `content-visibility: auto` on `.section`, paper texture disabled on mobile, BorderGlow simplified to ~6 GPU layers

### BorderGlow (homepage cards)
- Pointer tracking via `getBoundingClientRect`
- CSS custom properties: `--edge-proximity`, `--cursor-angle`
- Two pseudo-elements: `.edge-light` (conic-gradient mask + box-shadow) and `::before` (gradient border)
- Colors: `#4A7C59`, `#8FBC8F`, `#D4A76A` (biophilic greens + gold)
- Touch devices: fully disabled

### Article TOC
- Desktop: sticky sidebar (240px), IntersectionObserver scroll-spy with `rootMargin: '-100px 0px -70% 0px'`
- Mobile: floating FAB button → bottom drawer with overlay
- Extracted server-side via regex from rendered HTML

### Finance Ticker (homepage marquee)
- **Self-contained component** — no custom hook (hook state management caused render issues)
- Data sources: Binance API (BTC/ETH/BNB), East Money API (NVDA/AAPL/GOOGL)
- Display: horizontal CSS marquee, 30s loop, hover-pause, color-coded dots
- **Sina Finance removed** — returns 403 from localhost (Referer check)
- **Alpha Vantage removed** — rate-limited demo key
- Polling: re-fetches on mount only (no interval polling)

### Removed Decorations
- Removed 🌿 emoji from DreamQuote `::before`
- Removed 🍃 emoji from Footer `::before`
- Removed 🌿 emoji from FinanceTicker heading
- BannerCover GitHub button removed
- Footer Email link removed, GitHub icon (SVG) added

### Technical Constraints
- `output: 'export'` → no API routes, no ISR, no middleware
- Dart Sass module system: each SCSS file must `@use` its own dependencies
- `next.config.ts` not supported in Next.js 14 — renamed to `.mjs`

---

## What's Working

- ✅ Full static export build (19 pages, 0 errors)
- ✅ Organic Biophilic design across all pages
- ✅ BorderGlow hover effect on PostCards
- ✅ Article TOC with scroll-spy (desktop + mobile)
- ✅ Dark mode toggle with localStorage persistence
- ✅ Client-side search (fuse.js)
- ✅ Finance ticker marquee (crypto + US stocks, live data)
- ✅ SEO: per-page metadata, OG tags, RSS, sitemap
- ✅ Mobile responsive (all breakpoints tested)
- ✅ Performance optimized (font optional, content-visibility, simplified BorderGlow)

---

## Pending / Future Work

- [ ] **Vercel deployment**: Connect GitHub repo, configure joshphe.top domain
- [ ] **Finance ticker polling**: Consider adding gentle interval polling (every 5min) for live updates
- [ ] **Giscus comments**: Add comment widget to post detail pages (needs GitHub Discussions setup)
- [ ] **Clean up unused code**: `CategoryList.tsx`, `TagCloud.tsx`, `data/friends.json`, `data/musics.json` are dead code from removed routes
- [ ] **velite**: `package.json` lists `velite` but it's not actually configured/used — data pipeline uses gray-matter + unified directly in `lib/posts.ts`
- [ ] **Image optimization**: Currently `images.unoptimized: true` due to static export limitation
