'use client';

import { useState } from 'react';
import type { DashboardData, DashboardProject } from '@/lib/dashboard';
import styles from '@/styles/components/Dashboard.module.scss';

type ProjectType = 'airdrop' | 'defi';
const DEFI_BASE_CAPITAL_USD = 10_000;

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2,
  }).format(value);
}

function formatQuantity(value: number) {
  if (value === 0) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);
}

function formatReward(project: DashboardProject) {
  if (!project.rewardQuantity) return project.rewardToken === '—' ? '—' : project.rewardToken;
  return `${formatQuantity(project.rewardQuantity)} ${project.rewardToken === '—' ? '' : project.rewardToken}`.trim();
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function formatApr(value: number | null) {
  return value === null ? '—' : `${value.toFixed(2)}%`;
}

function statusTone(status: string) {
  if (status.includes('变现') || status.includes('退出')) return styles.statusDone;
  if (status === '已获奖励') return styles.statusRewarded;
  return styles.statusTracking;
}

function AirdropRow({ project }: { project: DashboardProject }) {
  return (
    <tr>
      <td>
        <strong className={styles.projectName}>{project.name}</strong>
        <span className={styles.projectSubtitle}>{project.subtitle}</span>
      </td>
      <td><span className={`${styles.status} ${statusTone(project.status)}`}>{project.status}</span></td>
      <td className={styles.numberCell}>{formatDate(project.date)}</td>
      <td className={styles.numberCell}>{formatUsd(project.costUsd)}</td>
      <td className={styles.numberCell}>{formatReward(project)}</td>
      <td className={`${styles.numberCell} ${project.realizedIncomeUsd > 0 ? styles.positive : ''}`}>{formatUsd(project.realizedIncomeUsd)}</td>
      <td><span className={styles.review}>{project.review}</span></td>
    </tr>
  );
}

function DefiRow({ project }: { project: DashboardProject }) {
  return (
    <tr>
      <td><strong className={styles.projectName}>{project.name}</strong><span className={styles.projectSubtitle}>{project.subtitle}</span></td>
      <td className={styles.numberCell}>{formatDate(project.date)}</td>
      <td className={styles.numberCell}>{formatDate(project.endDate)}</td>
      <td><span className={`${styles.status} ${statusTone(project.status)}`}>{project.status}</span></td>
      <td className={styles.numberCell}>{formatUsd(project.costUsd)}</td>
      <td className={`${styles.numberCell} ${project.realizedIncomeUsd > 0 ? styles.positive : ''}`}>{formatUsd(project.realizedIncomeUsd)}</td>
      <td className={`${styles.numberCell} ${project.annualizedApr && project.annualizedApr > 0 ? styles.positive : ''}`}>{formatApr(project.annualizedApr)}</td>
      <td><span className={styles.review}>{project.review}</span></td>
    </tr>
  );
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const pageSize = 10;
  const [activeType, setActiveType] = useState<ProjectType>('airdrop');
  const [page, setPage] = useState(1);
  const projects = activeType === 'airdrop' ? data.airdrops : data.defi;
  const activeSummary = {
    totalProjects: projects.length,
    totalCostUsd: projects.reduce((sum, item) => sum + item.costUsd, 0),
    realizedIncomeUsd: projects.reduce((sum, item) => sum + item.realizedIncomeUsd, 0),
  };
  const netIncomeUsd = activeSummary.realizedIncomeUsd - activeSummary.totalCostUsd;
  const defiReturnRate = (activeSummary.realizedIncomeUsd / DEFI_BASE_CAPITAL_USD) * 100;
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const pageItems = projects.slice((page - 1) * pageSize, page * pageSize);

  const switchType = (type: ProjectType) => {
    setActiveType(type);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div><h1>实践记录</h1><p>简单记录参与过程、投入与已实现收益</p></div>
          <div className={styles.typeTabs} role="group" aria-label="项目类型">
            <button type="button" aria-pressed={activeType === 'airdrop'} className={activeType === 'airdrop' ? styles.activeTab : ''} onClick={() => switchType('airdrop')}>空投</button>
            <button type="button" aria-pressed={activeType === 'defi'} className={activeType === 'defi' ? styles.activeTab : ''} onClick={() => switchType('defi')}>DeFi</button>
          </div>
        </header>

        <section className={styles.summaryGrid} aria-label="收益总览">
          <div className={styles.summaryCard}><span>参与项目</span><strong>{activeSummary.totalProjects}</strong></div>
          <div className={styles.summaryCard}><span>{activeType === 'airdrop' ? '累计成本' : '固定投入本金'}</span><strong>{formatUsd(activeType === 'airdrop' ? activeSummary.totalCostUsd : DEFI_BASE_CAPITAL_USD)}</strong></div>
          <div className={styles.summaryCard}><span>已实现收益</span><strong>{formatUsd(activeSummary.realizedIncomeUsd)}</strong></div>
          <div className={styles.summaryCard}><span>{activeType === 'airdrop' ? '净收益' : '累计收益率（非年化）'}</span><strong>{activeType === 'airdrop' ? formatUsd(netIncomeUsd) : formatApr(defiReturnRate)}</strong></div>
        </section>

        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}><h2>{activeType === 'airdrop' ? '空投项目' : 'DeFi 项目'}</h2><span>按参与{activeType === 'defi' ? '开始' : ''}时间排序</span></div>

          <div className={styles.tableWrap}>
            <table className={styles.projectTable}>
              <thead>
                {activeType === 'airdrop' ? <tr><th>项目</th><th>状态</th><th>参与时间</th><th>成本</th><th>奖励</th><th>已实现收益</th><th>简短复盘</th></tr> : <tr><th>项目</th><th>开始时间</th><th>结束时间</th><th>状态</th><th>投入成本</th><th>已实现收益</th><th>年化 APR</th><th>简短复盘</th></tr>}
              </thead>
              <tbody>
                {pageItems.map((project) => activeType === 'airdrop' ? <AirdropRow key={project.id} project={project} /> : <DefiRow key={project.id} project={project} />)}
                {pageItems.length === 0 && <tr><td colSpan={activeType === 'airdrop' ? 7 : 8} className={styles.emptyState}>暂无项目记录</td></tr>}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination} aria-label="分页">
            <span>共 {projects.length} 条 · 第 {page}/{totalPages} 页</span>
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
