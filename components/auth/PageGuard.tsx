'use client';

import { useRole } from '@/hooks/useRole';
import styles from '@/styles/components/PageGuard.module.scss';

export default function PageGuard({ children }: { children: React.ReactNode }) {
  const role = useRole();

  if (role === 'loading') return null;
  if (role === 'blogger') return <>{children}</>;

  // Guest — show access denied
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>需要博主权限</h2>
        <p className={styles.desc}>游客模式下无法访问此页面。请使用博主令牌登录后查看。</p>
      </div>
    </div>
  );
}
