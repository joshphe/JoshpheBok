'use client';

import { useMemo, useState } from 'react';
import type { DashboardData, DashboardProject } from '@/lib/dashboard';
import styles from '@/styles/components/Dashboard.module.scss';

type ProjectType = 'airdrop' | 'defi';

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value);
}

function formatQuantity(value: number) {
  if (value === 0) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function statusTone(status: string) {
  if (status.includes('变现') || status.includes('结束')) return styles.statusDone;
  if (status.includes('奖励')) return styles.statusRewarded;
  return styles.statusTracking;
}

function ProjectRow({ project }: { project: DashboardProject }) {
  return (
    <tr>
      <td>
        <strong className={styles.projectName}>{project.name}</strong>
        <span className={styles.projectSubtitle}>{project.subtitle}</span>
      </td>
      <td><span className={`${styles.status} ${statusTone(project.status)}`}>{project.status}</span></td>
      <td className={styles.numberCell}>{formatDate(project.date)}</td>
      <td className={styles.numberCell}>{formatUsd(project.costUsd)}</td>
      <td>{project.rewardToken}</td>
      <td className={styles.numberCell}>{formatQuantity(project.rewardQuantity)}</td>
      <td className={`${styles.numberCell} ${project.realizedIncomeUsd > 0 ? styles.positive : ''}`}>{formatUsd(project.realizedIncomeUsd)}</td>
      <td><span className={styles.review}>{project.review}</span></td>
    </tr>
  );
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const pageSize = 10;
  const [activeType, setActiveType] = useState<ProjectType>('airdrop');
  const [status, setStatus] = useState('全部');
  const [page, setPage] = useState(1);
  const projects = activeType === 'airdrop' ? data.airdrops : data.defi;
  const activeSummary = useMemo(() => ({
    totalProjects: projects.length,
    totalCostUsd: projects.reduce((sum, item) => sum + item.costUsd, 0),
    realizedIncomeUsd: projects.reduce((sum, item) => sum + item.realizedIncomeUsd, 0),
    rewardValueUsd: projects.reduce((sum, item) => sum + item.rewardValueUsd, 0),
  }), [projects]);
  const statuses = useMemo(() => ['全部', ...new Set(projects.map((item) => item.status))], [projects]);
  const visible = status === '全部' ? projects : projects.filter((item) => item.status === status);
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

  const switchType = (type: ProjectType) => {
    setActiveType(type);
    setStatus('全部');
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <p className={styles.kicker}>Yield Journal</p>
          <h1>空投与 DeFi Dashboard</h1>
          <p>记录每一次链上探索，以及时间最终给出的答案。</p>
        </header>

        <section className={styles.summaryGrid} aria-label="收益总览">
          <div className={styles.summaryCard}><span>项目总数</span><strong>{activeSummary.totalProjects}</strong><small>{activeType === 'airdrop' ? '空投项目' : 'DeFi 项目'}</small></div>
          <div className={styles.summaryCard}><span>累计成本</span><strong>{formatUsd(activeSummary.totalCostUsd)}</strong><small>{activeType === 'airdrop' ? '空投 Gas 与手续费' : 'DeFi 手续费'}</small></div>
          <div className={styles.summaryCard}><span>已实现收益</span><strong className={styles.positive}>{formatUsd(activeSummary.realizedIncomeUsd)}</strong><small>{activeType === 'airdrop' ? '空投已变现收益' : 'DeFi 净收益'}</small></div>
          <div className={styles.summaryCard}><span>奖励总估值</span><strong>{formatUsd(activeSummary.rewardValueUsd)}</strong><small>{activeType === 'airdrop' ? '包含未变现空投奖励' : 'DeFi 奖励收入'}</small></div>
        </section>

        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.typeTabs}>
              <button className={activeType === 'airdrop' ? styles.activeTab : ''} onClick={() => switchType('airdrop')}>空投 <span>{data.airdrops.length}</span></button>
              <button className={activeType === 'defi' ? styles.activeTab : ''} onClick={() => switchType('defi')}>DeFi <span>{data.defi.length}</span></button>
            </div>
            <div className={styles.filters}>
              {statuses.map((item) => (
                <button key={item} className={status === item ? styles.activeFilter : ''} onClick={() => { setStatus(item); setPage(1); }}>{item}</button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.projectTable}>
              <thead>
                <tr>
                  <th>项目名称</th>
                  <th>项目状态</th>
                  <th>参与时间</th>
                  <th>成本</th>
                  <th>奖励币种</th>
                  <th>奖励数量</th>
                  <th>已实现收益</th>
                  <th>简短复盘</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((project) => <ProjectRow key={project.id} project={project} />)}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination} aria-label="分页">
            <span>共 {visible.length} 条 · 第 {page}/{totalPages} 页</span>
            <div>
              <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                <button key={item} className={page === item ? styles.activePage : ''} onClick={() => setPage(item)}>{item}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>下一页</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
