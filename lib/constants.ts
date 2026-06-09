export const SITE = {
  title: '暮光之城',
  subtitle: '从来没有真正的绝境, 只有心灵的迷途',
  description: '一个专注数据库技术与后端开发的个人博客',
  author: 'JinPeng Wang',
  url: 'https://joshphe.top',
  github: 'https://github.com/joshphe',
  email: '784118046@qq.com',
  since: 2021,
  locale: 'zh-CN',
} as const;

export const NAV = [
  { label: '首页', href: '/', icon: 'home' },
  { label: '目录', href: '/tags', icon: 'list' },
  { label: '归档', href: '/archives', icon: 'archive' },
  { label: '关于', href: '/about', icon: 'user' },
] as const;

export const PROFILE = {
  avatar: '/images/avatar.jpg',
  career: 'Software Engineer',
  intro: 'If you wish to succeed, you should use persistence as your good friend, experience as your reference, prudence as your brother and hope as your sentry.',
} as const;

export const PER_PAGE = 6;
