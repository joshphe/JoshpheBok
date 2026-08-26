import 'server-only';
import { prisma } from '@/lib/prisma';

export interface DashboardProject {
  id: string;
  type: 'airdrop' | 'defi';
  name: string;
  subtitle: string;
  status: string;
  costUsd: number;
  rewardToken: string;
  rewardQuantity: number;
  realizedIncomeUsd: number;
  rewardValueUsd: number;
  review: string;
  date: string | null;
  endDate: string | null;
  annualizedApr: number | null;
}

export interface DashboardData {
  airdrops: DashboardProject[];
  defi: DashboardProject[];
  summary: {
    totalProjects: number;
    totalCostUsd: number;
    realizedIncomeUsd: number;
    rewardValueUsd: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const [airdrops, defi] = await Promise.all([
    prisma.airdropProject.findMany({ orderBy: [{ participatedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }] }),
    prisma.defiProject.findMany({ orderBy: [{ startedAt: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }] }),
  ]);

  const airdropProjects: DashboardProject[] = airdrops.map((project) => ({
    id: `airdrop-${project.id}`,
    type: 'airdrop',
    name: project.name,
    subtitle: project.interactionType || project.walletType || '空投项目',
    status: project.status === '持续关注' ? '参与中' : project.status,
    costUsd: Number(project.costUsd),
    rewardToken: project.rewardToken || '—',
    rewardQuantity: Number(project.rewardQuantity),
    realizedIncomeUsd: Number(project.realizedIncomeUsd),
    rewardValueUsd: Number(project.rewardValueUsd),
    review: project.review || '暂无复盘',
    date: project.participatedAt?.toISOString() ?? null,
    endDate: null,
    annualizedApr: null,
  }));

  const defiProjects: DashboardProject[] = defi.map((project) => {
    const principal = Number(project.principalUsd);
    const income = Number(project.netIncomeUsd);
    const end = project.endedAt ?? new Date();
    const days = project.startedAt ? Math.max(1, Math.ceil((end.getTime() - project.startedAt.getTime()) / 86_400_000)) : null;
    const annualizedApr = principal > 0 && days ? (income / principal) * (365 / days) * 100 : null;
    return {
      id: `defi-${project.id}`,
      type: 'defi',
      name: project.name,
      subtitle: `${project.platform} · ${project.productType}`,
      status: project.status === '进行中' ? '进行中' : '已退出',
      costUsd: principal,
      rewardToken: '',
      rewardQuantity: 0,
      realizedIncomeUsd: income,
      rewardValueUsd: income,
      review: project.review || '暂无复盘',
      date: project.startedAt?.toISOString() ?? null,
      endDate: project.endedAt?.toISOString() ?? null,
      annualizedApr,
    };
  });

  const all = [...airdropProjects, ...defiProjects];
  return {
    airdrops: airdropProjects,
    defi: defiProjects,
    summary: {
      totalProjects: all.length,
      totalCostUsd: all.reduce((sum, item) => sum + item.costUsd, 0),
      realizedIncomeUsd: all.reduce((sum, item) => sum + item.realizedIncomeUsd, 0),
      rewardValueUsd: all.reduce((sum, item) => sum + item.rewardValueUsd, 0),
    },
  };
}
