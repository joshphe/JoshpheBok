import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AirdropProject" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "walletType" TEXT NOT NULL DEFAULT '',
      "walletMasked" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL,
      "interactionType" TEXT NOT NULL DEFAULT '',
      "participatedAt" TIMESTAMP(3),
      "costUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "rewardToken" TEXT NOT NULL DEFAULT '',
      "rewardQuantity" DECIMAL(24,8) NOT NULL DEFAULT 0,
      "rewardPriceUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "realizedIncomeUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "rewardValueUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "netValueUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "review" TEXT NOT NULL DEFAULT '',
      "projectUrl" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DefiProject" (
      "id" SERIAL PRIMARY KEY,
      "sourceKey" TEXT NOT NULL UNIQUE,
      "platform" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "productType" TEXT NOT NULL,
      "startedAt" TIMESTAMP(3),
      "endedAt" TIMESTAMP(3),
      "principalUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "feeUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "rewardUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "netIncomeUsd" DECIMAL(18,8) NOT NULL DEFAULT 0,
      "annualizedRate" DECIMAL(12,8),
      "status" TEXT NOT NULL,
      "durationDays" INTEGER,
      "review" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AirdropProject_status_idx" ON "AirdropProject"("status")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "AirdropProject_participatedAt_idx" ON "AirdropProject"("participatedAt")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "DefiProject_platform_idx" ON "DefiProject"("platform")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "DefiProject_status_idx" ON "DefiProject"("status")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "DefiProject_startedAt_idx" ON "DefiProject"("startedAt")');

  console.log('Dashboard tables are ready. Existing tables were preserved.');
} finally {
  await prisma.$disconnect();
}
