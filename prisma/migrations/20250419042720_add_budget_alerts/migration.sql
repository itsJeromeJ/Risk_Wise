/*
  Warnings:

  - You are about to drop the `Goal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `market_data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `risk_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- DropForeignKey
ALTER TABLE "risk_profiles" DROP CONSTRAINT "risk_profiles_userId_fkey";

-- DropTable
DROP TABLE "Goal";

-- DropTable
DROP TABLE "market_data";

-- DropTable
DROP TABLE "risk_profiles";

-- DropEnum
DROP TYPE "RiskLevel";

-- CreateTable
CREATE TABLE "budget_alerts" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "threshold50Sent" BOOLEAN NOT NULL DEFAULT false,
    "threshold70Sent" BOOLEAN NOT NULL DEFAULT false,
    "threshold90Sent" BOOLEAN NOT NULL DEFAULT false,
    "budgetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_alerts_budgetId_idx" ON "budget_alerts"("budgetId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_alerts_budgetId_month_year_key" ON "budget_alerts"("budgetId", "month", "year");

-- AddForeignKey
ALTER TABLE "budget_alerts" ADD CONSTRAINT "budget_alerts_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
