import { notFound, redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from './LoginForm';
import styles from '@/styles/components/Admin.module.scss';

export default async function AdminLoginPage({ params }: { params: Promise<{ adminPath: string }> }) {
  const { adminPath } = await params;
  if (!process.env.ADMIN_PATH || adminPath !== process.env.ADMIN_PATH) notFound();
  if (await isAdminAuthenticated()) redirect(`/${adminPath}`);
  return <main className={styles.loginPage}><LoginForm /></main>;
}
