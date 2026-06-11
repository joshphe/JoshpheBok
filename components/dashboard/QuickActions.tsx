'use client';

import styles from '@/styles/components/dashboard/QuickActions.module.scss';

const ACTIONS = [
  { icon: '📤', label: '添加钱包', key: 'wallet' },
  { icon: '🔗', label: '连接 CEX', key: 'cex' },
  { icon: '📄', label: '导入 CSV', key: 'csv' },
];

export default function QuickActions() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>⚡ 快捷操作</h3>
      <div className={styles.actions}>
        {ACTIONS.map((action) => (
          <button
            key={action.key}
            className={styles.btn}
            disabled
            title="即将推出"
          >
            <span className={styles.btnIcon}>{action.icon}</span>
            {action.label}
            <span className={styles.comingSoon}>即将推出</span>
          </button>
        ))}
      </div>
    </div>
  );
}
