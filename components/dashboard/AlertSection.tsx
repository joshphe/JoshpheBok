'use client';

import type { AlertItem } from './types';
import styles from '@/styles/components/dashboard/AlertSection.module.scss';

const SEVERITY_ICON: Record<string, string> = {
  warning: '⚠️',
  info: 'ℹ️',
  critical: '🚨',
};

interface Props {
  alerts: AlertItem[];
  isLoading: boolean;
}

export default function AlertSection({ alerts, isLoading }: Props) {
  const unreadCount = alerts.length;

  if (isLoading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          🔔 警报
        </h3>
        <div className={styles.empty}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        🔔 警报
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </h3>

      {alerts.length === 0 ? (
        <div className={styles.empty}>✅ 一切正常，暂无警报</div>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${styles.item} ${styles[alert.severity] ?? ''}`}
          >
            <span className={styles.severityIcon}>
              {SEVERITY_ICON[alert.severity] ?? 'ℹ️'}
            </span>
            <div className={styles.content}>
              <div className={styles.alertTitle}>{alert.title}</div>
              <div className={styles.alertMsg}>{alert.message}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
