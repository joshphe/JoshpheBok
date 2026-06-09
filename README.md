# 暮光之城 (Joshphe's Blog)

基于 Next.js 14 构建的个人技术博客，部署在 Vercel 上。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: SCSS Modules + CSS Variables (暗色模式支持)
- **内容**: Markdown + gray-matter + unified/remark/rehype
- **代码高亮**: Shiki (rehype-pretty-code)
- **搜索**: fuse.js 客户端搜索
- **评论**: Giscus (GitHub Discussions)
- **部署**: Vercel (静态导出)

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 构建

```bash
npm run build
```

静态文件输出到 `out/` 目录。

## 项目结构

```
├── app/              # Next.js App Router 页面
├── components/       # React 组件
│   ├── layout/       # Header, Footer
│   ├── post/         # PostCard, PostGrid, PostDetail, PostTOC, PostNav
│   ├── widgets/      # BannerCover, DreamQuote, TagCloud, CategoryList
│   └── ui/           # ThemeToggle, Pagination, BackToTop
├── content/posts/    # Markdown 文章
├── data/             # friends.json, musics.json
├── lib/              # 数据访问层和工具函数
├── public/           # 静态资源
├── scripts/          # 构建脚本 (RSS, Sitemap, Search)
└── styles/           # SCSS 全局样式和组件样式
```

## 文章 Frontmatter

```yaml
---
title: "文章标题"
slug: "url-safe-slug"
date: "2021-05-13"
summary: "文章摘要"
tags: ["tag1", "tag2"]
categories: ["CategoryName"]
img: "https://example.com/cover.jpg"
toc: true
---
```

## 部署到 Vercel

1. 将项目推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. 构建设置会自动检测（Next.js 框架）
4. 输出目录: `out`
5. 添加自定义域名: joshphe.top

## License

MIT
