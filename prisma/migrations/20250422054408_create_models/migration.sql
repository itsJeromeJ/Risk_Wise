-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('MORTGAGE', 'CREDIT_CARD', 'STUDENT_LOAN', 'CAR_LOAN', 'PERSONAL_LOAN', 'OTHER');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "debtId" TEXT;

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "interestRate" DECIMAL(65,30) NOT NULL,
    "minimumPayment" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" "DebtType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_payments" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "debtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debts_userId_idx" ON "debts"("userId");

-- CreateIndex
CREATE INDEX "debt_payments_debtId_idx" ON "debt_payments"("debtId");

-- CreateIndex
CREATE INDEX "transactions_debtId_idx" ON "transactions"("debtId");

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
