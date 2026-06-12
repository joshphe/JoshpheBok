# 暮光之城 (Joshphe's Blog)

基于 Next.js 构建的个人技术博客，部署在 Vercel 上。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: SCSS Modules + CSS Variables（暗色模式支持）
- **内容**: Markdown + gray-matter + unified/remark/rehype
- **代码高亮**: Shiki (rehype-pretty-code)
- **搜索**: fuse.js 客户端搜索
- **数据库**: Supabase（PostgreSQL，行级安全）
- **认证**: Supabase Auth
- **部署**: Vercel（SSR + 静态生成混合）

## 功能

- 📝 **技术博客** — Markdown 写作，代码高亮，目录导航
- 📊 **资产组合管理** — 手动登记美股/虚拟货币买卖记录，实时市价盈亏计算
- 🔍 **全文搜索** — 基于 fuse.js 的客户端模糊搜索
- 🌙 **暗色模式** — CSS Variables 驱动的主题切换
- 🔐 **访问控制** — 游客/博主双模式，敏感页面需登录

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
├── app/              # Next.js App Router（页面 + API Routes）
│   └── api/          # 服务端 API（数据代理）
├── components/
│   ├── portfolio/    # 资产组合管理
│   ├── dashboard/    # 仪表盘组件（已弃用）
│   ├── layout/       # 导航、Header、Footer
│   ├── post/         # PostCard, PostGrid, PostDetail
│   ├── widgets/      # 市场行情、Web3 面板
│   └── ui/           # ThemeToggle, Pagination, BackToTop
├── content/posts/    # Markdown 文章
├── hooks/            # 自定义 Hooks（usePolling, useRole）
├── lib/              # 数据访问层、工具函数、API 客户端
│   └── api/          # 链数据、市场数据模块
├── public/           # 静态资源
├── scripts/          # 构建脚本（RSS, Sitemap, Search）
├── styles/           # SCSS 全局样式和组件样式
└── supabase/         # 数据库迁移脚本
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
4. 在 Settings → Environment Variables 添加所需的环境变量
5. 添加自定义域名

## License

MIT
