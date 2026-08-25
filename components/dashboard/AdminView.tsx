'use client';

import { useMemo, useState } from 'react';
import type { DashboardData, DashboardProject } from '@/lib/dashboard';
import styles from '@/styles/components/Admin.module.scss';

type FormValue = Omit<DashboardProject, 'id' | 'rewardValueUsd'> & { id?: string };
const empty: FormValue = { type: 'airdrop', name: '', subtitle: '', status: '持续关注', costUsd: 0, rewardToken: '', rewardQuantity: 0, realizedIncomeUsd: 0, review: '', date: '' };

export default function AdminView({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [activeType, setActiveType] = useState<'airdrop' | 'defi'>('airdrop');
  const [form, setForm] = useState<FormValue>(empty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const rows = useMemo(() => activeType === 'airdrop' ? data.airdrops : data.defi, [activeType, data]);
  const reload = async () => { const response = await fetch('/api/admin/projects/data', { cache: 'no-store' }); if (response.ok) setData(await response.json()); };
  const edit = (project: DashboardProject) => setForm({ id: project.id, type: project.type, name: project.name, subtitle: project.subtitle, status: project.status, costUsd: project.costUsd, rewardToken: project.rewardToken === '—' ? '' : project.rewardToken, rewardQuantity: project.rewardQuantity, realizedIncomeUsd: project.realizedIncomeUsd, review: project.review, date: project.date ? project.date.slice(0, 10) : '' });
  const reset = (type = activeType) => setForm({ ...empty, type, status: type === 'defi' ? '已结束' : '持续关注' });
  const update = (key: keyof FormValue, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setMessage(''); const response = await fetch('/api/admin/projects', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const result = await response.json(); setSaving(false); if (!response.ok) return setMessage(result.error || '保存失败'); await reload(); reset(form.type); setMessage('已保存'); };
  const remove = async (project: DashboardProject) => { if (!window.confirm(`确定删除“${project.name}”吗？此操作无法撤销。`)) return; const response = await fetch('/api/admin/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id, type: project.type }) }); if (response.ok) { await reload(); if (form.id === project.id) reset(); } else setMessage('删除失败'); };

  return <main className={styles.adminPage}>
    <header className={styles.adminHeader}><div><span>Private Console</span><h1>收益记录管理</h1><p>新增、编辑和删除空投及 DeFi 项目。</p></div><a href="/api/admin/logout">退出登录</a></header>
    <div className={styles.adminLayout}>
      <section className={styles.editor}><h2>{form.id ? '编辑项目' : '新增项目'}</h2><form onSubmit={save}>
        <label>项目类型<select value={form.type} onChange={(e) => { const type = e.target.value as 'airdrop' | 'defi'; setActiveType(type); reset(type); }}><option value="airdrop">空投</option><option value="defi">DeFi</option></select></label>
        <label>项目名称<input required value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
        <label>{form.type === 'defi' ? '平台 · 产品类型' : '交互类型'}<input value={form.subtitle} placeholder={form.type === 'defi' ? 'Binance · 稳定币理财' : '测试网交互'} onChange={(e) => update('subtitle', e.target.value)} /></label>
        <label>项目状态<input required value={form.status} onChange={(e) => update('status', e.target.value)} /></label>
        <label>参与时间<input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} /></label>
        <div className={styles.fieldGrid}><label>成本（USD）<input type="number" step="any" value={form.costUsd} onChange={(e) => update('costUsd', Number(e.target.value))} /></label><label>奖励币种<input value={form.rewardToken} onChange={(e) => update('rewardToken', e.target.value)} /></label><label>奖励数量<input type="number" step="any" value={form.rewardQuantity} onChange={(e) => update('rewardQuantity', Number(e.target.value))} /></label><label>已实现收益（USD）<input type="number" step="any" value={form.realizedIncomeUsd} onChange={(e) => update('realizedIncomeUsd', Number(e.target.value))} /></label></div>
        <label>简短复盘<textarea rows={4} value={form.review} onChange={(e) => update('review', e.target.value)} /></label>
        {message && <p className={styles.formMessage}>{message}</p>}<div className={styles.formActions}><button type="submit" disabled={saving}>{saving ? '保存中…' : '保存项目'}</button>{form.id && <button type="button" onClick={() => reset()}>取消编辑</button>}</div>
      </form></section>
      <section className={styles.records}><div className={styles.recordHeader}><div><button className={activeType === 'airdrop' ? styles.active : ''} onClick={() => { setActiveType('airdrop'); reset('airdrop'); }}>空投 {data.airdrops.length}</button><button className={activeType === 'defi' ? styles.active : ''} onClick={() => { setActiveType('defi'); reset('defi'); }}>DeFi {data.defi.length}</button></div><span>{rows.length} 条记录</span></div><div className={styles.recordList}>{rows.map((project) => <article key={project.id}><div><strong>{project.name}</strong><span>{project.status} · {project.subtitle}</span></div><div><button onClick={() => edit(project)}>编辑</button><button className={styles.danger} onClick={() => remove(project)}>删除</button></div></article>)}</div></section>
    </div>
  </main>;
}
