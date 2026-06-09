# MyBok — Blog Rewrite Progress

## Project Overview

- **From**: Hexo (matery theme) → **To**: Next.js 14 + Vercel static export
- **Location**: `/Users/0xjasper/Documents/MyBok`
- **Content**: 8 Chinese tech articles (database/backend focused)
- **Design**: Organic Biophilic (forest green + earth tones + organic curves)
- **Target domain**: joshphe.xyz (deployed)

---

## 2026-06-09 Updates

### Cleanup
- Deleted unused files: `CategoryList.tsx`, `TagCloud.tsx`, `TagCloud.module.scss`, `friends.json`, `musics.json`
- Removed `velite` dependency (never configured)

### Design Overhaul (P0 → P1 → P2)

**P0: Card Radii + Shadows**
- `$radius-md`: 14px → 18px, `$radius-lg`: 20px → 24px, `$radius-xl`: 28px → 32px
- Shadows: single-layer → dual-layer, deeper and more visible

**P1: Header Glass + Typography**
- Header `backdrop-filter`: `blur(16px)` → `blur(24px) saturate(1.2)`
- Mobile nav matching glass effect
- BannerCover: added italic English accent line `— explore · create · reflect —`

**P2: Hero Refactor**
- Removed green gradient, avatar, and title from BannerCover
- Replaced with full-screen background image (randomly picked from `public/images/background/`)
- Initially tried rounded card layout → reverted to full-width edge-to-edge
- Switched from CSS `background-image` to `<img>` tag for faster loading (HTML parse vs JS execution)
- Added `fetchPriority="high"` and 0.6s fade-in transition
- Images resized from 1.5-1.7MB (7500×5000) → 220-365KB (1920px wide)

### FinanceTicker
- Added 5-minute interval polling with `Promise.allSettled` (partial failure resilience)
- API calls wrapped in try-catch with 8s AbortController timeout
- Position changed multiple times: fixed bottom → below Header → **overlaid on Hero top**
- Glass effect when overlaid: `rgba(255,255,255,0.12)` + `backdrop-blur(8px)`, white text

### Footer & BackToTop
- Footer height halved: `margin-top` 5rem→2.5rem, `padding` 3rem→1.5rem
- BackToTop: `bottom: 4rem`, `z-index: 1000` (was adjusted for fixed ticker, kept as-is)

### Bug Fixes
- **ThemeToggle hydration error** (#425/#418/#423): Added `mounted` state to prevent SSR/client mismatch
- **FinanceTicker API failures**: `Promise.all` → `Promise.allSettled`, per-request try-catch

### Vercel Deployment
- `vercel.json`: removed `framework: "nextjs"` (caused `routes-manifest.json` error with static export)
- Vercel dashboard: Framework Preset must be set to **Other**
- Added `.node-version` (Node 22)
- Added `@vercel/speed-insights` + `@vercel/analytics`
- Domain: joshphe.xyz (mobile DNS issue resolved by disabling Private DNS)

### Post-archive Tasks
- [x] Vercel deployment with custom domain
- [x] Clean up unused files + velite dependency
- [x] FinanceTicker interval polling (5 min)
- [x] Design overhaul (P0/P1/P2)
- [x] Speed Insights + Analytics

---

## Current State

### Project Structure

```
MyBok/
├── app/
│   ├── layout.tsx                # SpeedInsights + Analytics + Header/Footer/BackToTop
│   ├── page.tsx                  # FinanceTicker(overlaid) → BannerCover(random bg) → DreamQuote → PostCards
│   ├── not-found.tsx             # 404
│   ├── about/page.tsx
│   ├── archives/page.tsx
│   ├── posts/
│   │   ├── page.tsx              # Paginated post list
│   │   └── [slug]/page.tsx       # Post detail + TOC
│   ├── search/page.tsx           # Client-side search (fuse.js)
│   └── tags/page.tsx             # Article directory (flat by date)
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Sticky glass header (blur 24px)
│   │   └── Footer.tsx            # Compact footer
│   ├── post/
│   │   ├── PostCard.tsx
│   │   ├── PostDetail.tsx
│   │   ├── PostGrid.tsx
│   │   ├── PostNav.tsx
│   │   └── PostTOC.tsx
│   ├── ui/
│   │   ├── BackToTop.tsx
│   │   ├── BorderGlow.tsx
│   │   ├── Pagination.tsx
│   │   └── ThemeToggle.tsx        # Fixed hydration with mounted guard
│   └── widgets/
│       ├── BannerCover.tsx        # Client component, <img> tag, random bg, fade-in
│       ├── DreamQuote.tsx
│       └── FinanceTicker.tsx      # Glass overlay on Hero, Promise.allSettled, 5min poll
├── content/posts/                 # 8 markdown articles
├── data/                          # (empty — friends.json, musics.json removed)
├── lib/
│   ├── constants.ts
│   ├── posts.ts
│   └── utils.ts
├── public/
│   └── images/background/         # 4 optimized bg images (1920px, ~250KB each)
├── scripts/
│   ├── generate-search-data.mjs
│   ├── generate-rss.mjs
│   └── generate-sitemap.mjs
├── styles/
│   ├── variables.scss             # Enhanced radii + dual-layer shadows
│   ├── globals.scss
│   └── components/                # Per-component SCSS modules
├── vercel.json                    # No framework preset, static output
├── .node-version                  # Node 22
├── next.config.mjs                # output: 'export', images.unoptimized
└── package.json                   # Cleaned (no velite)
```

### Page Layout (Homepage)

```
┌─────────────────────────┐
│  Header (sticky, glass)  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ FinanceTicker 玻璃态 │ │  ← absolute overlay
│ ├─────────────────────┤ │
│ │  Hero <img>          │ │  ← random bg, fetchpriority=high
│ │  副标题 + accent     │ │  ← fade-in on load
│ └─────────────────────┘ │
├─────────────────────────┤
│  DreamQuote             │
├─────────────────────────┤
│  PostCards × 3          │
├─────────────────────────┤
│  Footer (compact)       │
└─────────────────────────┘
```

### Routes (17 static pages)

| Route | Description |
|-------|-------------|
| `/` | Homepage (ticker overlay → Hero → DreamQuote → 3 random PostCards) |
| `/posts` | Post list (paginated, 6/page) |
| `/posts/[slug]` | Post detail + TOC (8 pages) |
| `/tags` | Article directory |
| `/archives` | Archive by year |
| `/about` | About page |
| `/search` | Client-side search |
| `/_not-found` | Custom 404 |
| `/feed.xml` | RSS |
| `/sitemap.xml` | Sitemap |

### Design Decisions

- **Hero bg**: `<img>` tag with `object-fit: cover` and `fetchPriority="high"` — loads during HTML parse
- **Random bg**: Client-side `useEffect` + `Math.random()` — works in both dev and static export
- **FinanceTicker**: Glass overlay on hero, `Promise.allSettled` for API resilience
- **ThemeToggle**: `mounted` guard pattern to prevent hydration mismatch
- **Card system**: ~18px radius, dual-layer green-tinted shadows
- **Performance**: Images downscaled to 1920px, Hero uses `<img>` for early loading

---

## Pending

- [ ] Giscus comments widget
- [ ] Decap CMS for online article editing
- [ ] Per-post OG image generation
