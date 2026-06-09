import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>页面不存在</p>
      <Link
        href="/"
        style={{
          padding: '0.5rem 1.5rem',
          background: 'var(--color-primary)',
          color: '#fff',
          borderRadius: '9999px',
        }}
      >
        返回首页
      </Link>
    </div>
  );
}
