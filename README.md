# 暮光之城 (Joshphe's Blog)

基于 Next.js 构建的个人技术博客，部署在 Vercel 上。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: SCSS Modules + CSS Variables（暗色模式支持）
- **内容**: Markdown + gray-matter + unified/remark/rehype
- **代码高亮**: Shiki (rehype-pretty-code)
- **部署**: Vercel（SSR + 静态生成混合）

## 功能

- 📝 **技术博客** — Markdown 写作，代码高亮，目录导航
- 📈 **公开市场看板** — 展示股票、加密货币与 Web3 市场信息
- 🌙 **暗色模式** — CSS Variables 驱动的主题切换
- 🌐 **完全公开** — 首页、文章、标签与关于页面均可直接访问

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

## 项目结构

```
├── app/              # Next.js App Router 页面
├── components/
│   ├── layout/       # 导航与页脚
│   ├── post/         # PostCard, PostGrid, PostDetail
│   ├── widgets/      # 市场行情、Web3 面板
│   └── ui/           # ThemeToggle, BackToTop
├── content/posts/    # Markdown 文章
├── hooks/            # 自定义 Hooks
├── lib/              # 内容与公开市场数据模块
├── public/           # 静态资源
├── scripts/          # 构建脚本（RSS, Sitemap, Search）
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
3. Framework Preset 选择 **Next.js**
4. 添加自定义域名

## License

MIT
