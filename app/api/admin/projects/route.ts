import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

type Input = { id?: string; type: 'airdrop' | 'defi'; name: string; subtitle: string; status: string; costUsd: number; rewardToken: string; rewardQuantity: number; realizedIncomeUsd: number; review: string; date?: string | null };
const number = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

function normalized(body: Input) {
  return { ...body, name: String(body.name || '').trim(), subtitle: String(body.subtitle || '').trim(), status: String(body.status || '').trim(), rewardToken: String(body.rewardToken || '').trim(), review: String(body.review || '').trim(), costUsd: number(body.costUsd), rewardQuantity: number(body.rewardQuantity), realizedIncomeUsd: number(body.realizedIncomeUsd), date: body.date ? String(body.date) : null };
}

function projectDate(value?: string | null) { return value ? new Date(`${value}T00:00:00.000Z`) : null; }

function idOf(id = '') { return Number(id.replace(/^(airdrop|defi)-/, '')); }
function refresh() { revalidatePath('/dashboard'); if (process.env.ADMIN_PATH) revalidatePath(`/${process.env.ADMIN_PATH}`); }

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = normalized(await request.json());
  if (!body.name || !body.status) return NextResponse.json({ error: '项目名称和状态不能为空' }, { status: 400 });
  if (body.type === 'airdrop') {
    await prisma.airdropProject.create({ data: { name: body.name, slug: `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'airdrop'}-${randomUUID().slice(0, 8)}`, interactionType: body.subtitle, status: body.status, participatedAt: projectDate(body.date), costUsd: body.costUsd, rewardToken: body.rewardToken, rewardQuantity: body.rewardQuantity, realizedIncomeUsd: body.realizedIncomeUsd, rewardValueUsd: body.realizedIncomeUsd, review: body.review } });
  } else {
    const [platform = 'DeFi', productType = 'DeFi'] = body.subtitle.split('·').map((v) => v.trim());
    await prisma.defiProject.create({ data: { sourceKey: randomUUID(), name: body.name, platform, productType, status: body.status, startedAt: projectDate(body.date), feeUsd: body.costUsd, rewardUsd: body.rewardQuantity, netIncomeUsd: body.realizedIncomeUsd, review: body.review } });
  }
  refresh();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = normalized(await request.json());
  const id = idOf(body.id);
  if (!id || !body.name || !body.status) return NextResponse.json({ error: '提交内容不完整' }, { status: 400 });
  if (body.type === 'airdrop') {
    await prisma.airdropProject.update({ where: { id }, data: { name: body.name, interactionType: body.subtitle, status: body.status, participatedAt: projectDate(body.date), costUsd: body.costUsd, rewardToken: body.rewardToken, rewardQuantity: body.rewardQuantity, realizedIncomeUsd: body.realizedIncomeUsd, review: body.review } });
  } else {
    const [platform = 'DeFi', productType = 'DeFi'] = body.subtitle.split('·').map((v) => v.trim());
    await prisma.defiProject.update({ where: { id }, data: { name: body.name, platform, productType, status: body.status, startedAt: projectDate(body.date), feeUsd: body.costUsd, rewardUsd: body.rewardQuantity, netIncomeUsd: body.realizedIncomeUsd, review: body.review } });
  }
  refresh();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, type } = await request.json() as Pick<Input, 'id' | 'type'>;
  const numericId = idOf(id);
  if (!numericId) return NextResponse.json({ error: '无效项目' }, { status: 400 });
  if (type === 'airdrop') await prisma.airdropProject.delete({ where: { id: numericId } });
  else await prisma.defiProject.delete({ where: { id: numericId } });
  refresh();
  return NextResponse.json({ ok: true });
}
