import Link from 'next/link';
import styles from '@/styles/components/Pagination.module.scss';

interface PaginationProps {
  current: number;
  total: number;
  basePath: string;
}

export default function Pagination({ current, total, basePath }: PaginationProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const prev = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;

  const pagePath = (p: number) => (p === 1 ? basePath || '/' : `${basePath}/page/${p}`);

  return (
    <nav className={styles.pagination} aria-label="分页">
      {prev ? (
        <Link href={pagePath(prev)} className={styles.arrow}>← 上一页</Link>
      ) : (
        <span className={styles.arrowDisabled}>← 上一页</span>
      )}

      <div className={styles.nums}>
        {pages.map((p) => (
          <Link
            key={p}
            href={pagePath(p)}
            className={`${styles.num} ${p === current ? styles.active : ''}`}
          >
            {p}
          </Link>
        ))}
      </div>

      {next ? (
        <Link href={pagePath(next)} className={styles.arrow}>下一页 →</Link>
      ) : (
        <span className={styles.arrowDisabled}>下一页 →</span>
      )}
    </nav>
  );
}
