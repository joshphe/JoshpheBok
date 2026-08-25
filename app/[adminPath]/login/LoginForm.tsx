'use client';

import { useActionState } from 'react';
import { login } from './actions';
import styles from '@/styles/components/Admin.module.scss';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: '' });
  return (
    <form action={action} className={styles.loginCard}>
      <span>Private Access</span>
      <h1>管理后台</h1>
      <p>请输入管理密码后继续。</p>
      <label>密码<input name="password" type="password" autoComplete="current-password" required autoFocus /></label>
      {state.error && <div className={styles.error}>{state.error}</div>}
      <button disabled={pending}>{pending ? '验证中…' : '进入后台'}</button>
    </form>
  );
}
