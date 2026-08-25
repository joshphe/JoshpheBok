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
    status: project.status,
    costUsd: Number(project.costUsd),
    rewardToken: project.rewardToken || '—',
    rewardQuantity: Number(project.rewardQuantity),
    realizedIncomeUsd: Number(project.realizedIncomeUsd),
    rewardValueUsd: Number(project.rewardValueUsd),
    review: project.review || '暂无复盘',
    date: project.participatedAt?.toISOString() ?? null,
  }));

  const defiProjects: DashboardProject[] = defi.map((project) => ({
    id: `defi-${project.id}`,
    type: 'defi',
    name: project.name,
    subtitle: `${project.platform} · ${project.productType}`,
    status: project.status,
    costUsd: Number(project.feeUsd),
    rewardToken: 'U',
    rewardQuantity: Number(project.rewardUsd),
    realizedIncomeUsd: Number(project.netIncomeUsd),
    rewardValueUsd: Number(project.rewardUsd),
    review: project.review || '暂无复盘',
    date: project.startedAt?.toISOString() ?? null,
  }));

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
