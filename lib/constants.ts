export const SITE = {
  title: '三水归堂',
  subtitle: '从来没有真正的绝境, 只有心灵的迷途',
  description: '一个专注数据库技术与后端开发的个人博客',
  keywords: ['数据库', '后端开发', 'PostgreSQL', 'MySQL', 'Redis', '技术博客'],
  author: 'Joshphe',
  url: 'https://joshphe.xyz',
  x: 'https://x.com/WangHou4128',
  email: '784118046@qq.com',
  since: 2021,
  locale: 'zh-CN',
} as const;

export const NAV = [
  { label: '首页', href: '/', icon: 'home' },
  { label: 'Dashboard', href: '/dashboard', icon: 'chart' },
  { label: 'Article', href: '/posts', icon: 'list' },
] as const;
