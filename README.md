# 三水归堂 (Joshphe's Blog)

基于 Next.js 构建的个人技术博客，部署在 Vercel 上。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: SCSS Modules + CSS Variables
- **内容**: Markdown + gray-matter + unified/remark/rehype
- **代码高亮**: Shiki (rehype-pretty-code)
- **数据库**: Neon PostgreSQL + Prisma
- **部署**: Vercel（SSR + 静态生成混合）

## 功能

- 📝 **技术博客** — Markdown 写作，代码高亮，目录导航
- 📊 **收益 Dashboard** — 汇总展示空投与 DeFi 项目、成本和收益
- 🔐 **管理后台** — 通过服务端权限验证维护空投与 DeFi 数据
- 🌐 **公开分享** — 首页、文章与 Dashboard 可直接访问

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
│   ├── dashboard/    # 空投与 DeFi Dashboard
│   ├── layout/       # 导航与页脚
│   ├── post/         # PostCard, PostGrid, PostDetail
│   ├── widgets/      # 首页视觉组件
│   └── ui/           # 通用交互组件
├── content/posts/    # Markdown 文章
├── hooks/            # 自定义 Hooks
├── lib/              # 内容处理、数据库查询与通用工具
├── prisma/           # Neon 数据模型和导入脚本
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
4. 根据 `.env.example` 配置 Neon 与管理后台环境变量
5. 添加自定义域名

## License

MIT
