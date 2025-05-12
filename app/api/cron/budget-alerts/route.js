import { NextResponse } from 'next/server';
import { checkBudgetAlerts } from '@/jobs/budgetAlerts';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get current month's data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get all budgets with their alerts
    const budgets = await prisma.budget.findMany({
      include: {
        user: true,
        budgetAlerts: {
          where: {
            month: currentMonth,
            year: currentYear,
          },
        },
      },
    });

    // For each budget, calculate current usage
    const budgetStatuses = await Promise.all(budgets.map(async (budget) => {
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: budget.user.id,
          type: 'EXPENSE',
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const totalExpenses = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      );

      const percentageUsed = (totalExpenses / Number(budget.amount)) * 100;

      return {
        userId: budget.user.id,
        userName: budget.user.name,
        email: budget.user.email,
        budgetAmount: Number(budget.amount),
        totalExpenses,
        percentageUsed,
        alertsSent: budget.budgetAlerts[0] || null
      };
    }));

    // Try to send a test alert
    if (budgetStatuses.length > 0) {
      const testResult = await checkBudgetAlerts();
      return NextResponse.json({
        message: 'Budget check completed',
        budgetStatuses,
        testResult
      });
    }

    return NextResponse.json({
      message: 'No budgets found',
      budgetStatuses
    });

  } catch (error) {
    console.error('Test budget alert failed:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
} 