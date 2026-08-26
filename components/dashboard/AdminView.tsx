'use client';

import { useMemo, useState } from 'react';
import type { DashboardData, DashboardProject } from '@/lib/dashboard';
import styles from '@/styles/components/Admin.module.scss';

type ProjectType = 'airdrop' | 'defi';
type FormValue = Omit<DashboardProject, 'id' | 'rewardValueUsd' | 'annualizedApr'> & { id?: string };
const PAGE_SIZE = 10;
const STATUS_OPTIONS = { airdrop: ['参与中', '已获奖励', '已变现', '未获奖励', '已放弃'], defi: ['进行中', '已退出'] } as const;
const emptyForm = (type: ProjectType): FormValue => ({ type, name: '', subtitle: '', status: STATUS_OPTIONS[type][0], costUsd: 0, rewardToken: '', rewardQuantity: 0, realizedIncomeUsd: 0, review: '', date: '', endDate: '' });
const formatUsd = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
const formatNumber = (value: number) => value ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value) : '—';
const calculateApr = (form: FormValue) => {
  if (form.type !== 'defi' || !form.date || form.costUsd <= 0) return null;
  const start = new Date(`${form.date}T00:00:00`);
  const end = form.endDate ? new Date(`${form.endDate}T00:00:00`) : new Date();
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
  return (form.realizedIncomeUsd / form.costUsd) * (365 / days) * 100;
};

export default function AdminView({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);
  const [activeType, setActiveType] = useState<ProjectType>('airdrop');
  const [form, setForm] = useState<FormValue>(emptyForm('airdrop'));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const rows = useMemo(() => activeType === 'airdrop' ? data.airdrops : data.defi, [activeType, data]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const previewApr = calculateApr(form);
  const reload = async () => { const response = await fetch('/api/admin/projects/data', { cache: 'no-store' }); if (response.ok) setData(await response.json()); };
  const openCreate = () => { setForm(emptyForm(activeType)); setMessage(''); setModalOpen(true); };
  const openEdit = (project: DashboardProject) => { setForm({ id: project.id, type: project.type, name: project.name, subtitle: project.subtitle, status: project.status, costUsd: project.costUsd, rewardToken: project.rewardToken === '—' ? '' : project.rewardToken, rewardQuantity: project.rewardQuantity, realizedIncomeUsd: project.realizedIncomeUsd, review: project.review, date: project.date ? project.date.slice(0, 10) : '', endDate: project.endDate ? project.endDate.slice(0, 10) : '' }); setMessage(''); setModalOpen(true); };
  const closeModal = () => { if (!saving) setModalOpen(false); };
  const update = (key: keyof FormValue, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const switchType = (type: ProjectType) => { setActiveType(type); setPage(1); };
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setMessage(''); const response = await fetch('/api/admin/projects', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); const result = await response.json(); setSaving(false); if (!response.ok) return setMessage(result.error || '保存失败'); await reload(); setModalOpen(false); setPage(1); };
  const remove = async (project: DashboardProject) => { if (!window.confirm(`确定删除“${project.name}”吗？此操作无法撤销。`)) return; const response = await fetch('/api/admin/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id, type: project.type }) }); if (response.ok) { await reload(); setPage((current) => Math.min(current, Math.max(1, Math.ceil((rows.length - 1) / PAGE_SIZE)))); } };

  return <main className={styles.adminPage}>
    <header className={styles.adminHeader}><div><span>Private Console</span><h1>收益记录管理</h1><p>新增、编辑和删除空投及 DeFi 项目。</p></div><div className={styles.adminActions}><button onClick={openCreate}>＋ 新增项目</button><a href="/api/admin/logout">退出登录</a></div></header>
    <section className={styles.records}>
      <div className={styles.recordHeader}><div><button className={activeType === 'airdrop' ? styles.active : ''} onClick={() => switchType('airdrop')}>空投 {data.airdrops.length}</button><button className={activeType === 'defi' ? styles.active : ''} onClick={() => switchType('defi')}>DeFi {data.defi.length}</button></div><span>{rows.length} 条记录</span></div>
      <div className={styles.adminTableWrap}><table className={styles.adminTable}><thead>{activeType === 'airdrop' ? <tr><th>项目名称</th><th>状态</th><th>参与时间</th><th>成本</th><th>奖励币种</th><th>奖励数量</th><th>已实现收益</th><th>简短复盘</th><th>操作</th></tr> : <tr><th>项目名称</th><th>状态</th><th>开始时间</th><th>结束时间</th><th>投入成本</th><th>已实现收益</th><th>年化 APR</th><th>简短复盘</th><th>操作</th></tr>}</thead><tbody>{pageRows.map((project) => activeType === 'airdrop' ? <tr key={project.id}><td><strong>{project.name}</strong><span>{project.subtitle}</span></td><td>{project.status}</td><td>{project.date ? project.date.slice(0, 10) : '—'}</td><td>{formatUsd(project.costUsd)}</td><td>{project.rewardToken || '—'}</td><td>{formatNumber(project.rewardQuantity)}</td><td className={project.realizedIncomeUsd > 0 ? styles.income : ''}>{formatUsd(project.realizedIncomeUsd)}</td><td><span className={styles.reviewCell}>{project.review}</span></td><td><div className={styles.rowActions}><button onClick={() => openEdit(project)}>编辑</button><button className={styles.danger} onClick={() => remove(project)}>删除</button></div></td></tr> : <tr key={project.id}><td><strong>{project.name}</strong><span>{project.subtitle}</span></td><td>{project.status}</td><td>{project.date ? project.date.slice(0, 10) : '—'}</td><td>{project.endDate ? project.endDate.slice(0, 10) : '—'}</td><td>{formatUsd(project.costUsd)}</td><td className={project.realizedIncomeUsd > 0 ? styles.income : ''}>{formatUsd(project.realizedIncomeUsd)}</td><td className={project.annualizedApr && project.annualizedApr > 0 ? styles.income : ''}>{project.annualizedApr === null ? '—' : `${project.annualizedApr.toFixed(2)}%`}</td><td><span className={styles.reviewCell}>{project.review}</span></td><td><div className={styles.rowActions}><button onClick={() => openEdit(project)}>编辑</button><button className={styles.danger} onClick={() => remove(project)}>删除</button></div></td></tr>)}</tbody></table></div>
      <div className={styles.adminPagination}><span>第 {page}/{totalPages} 页</span><div><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>上一页</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => <button key={item} className={page === item ? styles.currentPage : ''} onClick={() => setPage(item)}>{item}</button>)}<button disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>下一页</button></div></div>
    </section>
    {modalOpen && <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="project-form-title">
      <div className={styles.modalHeader}><div><span>{form.id ? 'Edit Record' : 'New Record'}</span><h2 id="project-form-title">{form.id ? '编辑项目' : '新增项目'}</h2></div><button type="button" aria-label="关闭" onClick={closeModal}>×</button></div>
      <form onSubmit={save}>
        <label>项目类型<select value={form.type} disabled={Boolean(form.id)} onChange={(e) => setForm(emptyForm(e.target.value as ProjectType))}><option value="airdrop">空投</option><option value="defi">DeFi</option></select></label>
        <label>项目名称<input required value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
        <label>{form.type === 'defi' ? '平台 · 产品类型' : '交互类型'}<input value={form.subtitle} placeholder={form.type === 'defi' ? 'Binance · 稳定币理财' : '测试网交互'} onChange={(e) => update('subtitle', e.target.value)} /></label>
        <div className={styles.fieldGrid}><label>项目状态<select required value={form.status} onChange={(e) => update('status', e.target.value)}>{STATUS_OPTIONS[form.type].map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>{form.type === 'airdrop' ? '参与时间' : '参与开始时间'}<input type="date" value={form.date || ''} onChange={(e) => update('date', e.target.value)} /></label></div>
        {form.type === 'airdrop' ? <div className={styles.fieldGrid}><label>成本（USD）<input type="number" step="any" value={form.costUsd} onChange={(e) => update('costUsd', Number(e.target.value))} /></label><label>奖励币种<input value={form.rewardToken} onChange={(e) => update('rewardToken', e.target.value)} /></label><label>奖励数量<input type="number" step="any" value={form.rewardQuantity} onChange={(e) => update('rewardQuantity', Number(e.target.value))} /></label><label>已实现收益（USD）<input type="number" step="any" value={form.realizedIncomeUsd} onChange={(e) => update('realizedIncomeUsd', Number(e.target.value))} /></label></div> : <><div className={styles.fieldGrid}><label>参与结束时间<input type="date" min={form.date || undefined} value={form.endDate || ''} onChange={(e) => update('endDate', e.target.value)} /></label><label>投入成本（USD）<input type="number" min="0" step="any" value={form.costUsd} onChange={(e) => update('costUsd', Number(e.target.value))} /></label></div><div className={styles.fieldGrid}><label>已实现收益（USD）<input type="number" step="any" value={form.realizedIncomeUsd} onChange={(e) => update('realizedIncomeUsd', Number(e.target.value))} /></label><label>折合年化 APR<input readOnly value={previewApr === null ? '填写成本和开始时间后自动计算' : `${previewApr.toFixed(2)}%`} /></label></div></>}
        <label>简短复盘<textarea rows={4} value={form.review} onChange={(e) => update('review', e.target.value)} /></label>
        {message && <p className={styles.formMessage}>{message}</p>}<div className={styles.formActions}><button type="submit" disabled={saving}>{saving ? '保存中…' : '保存项目'}</button><button type="button" onClick={closeModal}>取消</button></div>
      </form>
    </section></div>}
  </main>;
}
