import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function checkBudgetAlerts() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  try {
    // Get all budgets with their users
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

    for (const budget of budgets) {
      // Get current month's transactions
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

      // Calculate total expenses
      const totalExpenses = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount),
        0
      );

      const percentageUsed = (totalExpenses / Number(budget.amount)) * 100;

      // Get or create budget alert record
      let alertRecord = budget.budgetAlerts[0];
      if (!alertRecord) {
        alertRecord = await prisma.budgetAlert.create({
          data: {
            month: currentMonth,
            year: currentYear,
            budgetId: budget.id,
          },
        });
      }

      // Check thresholds and send alerts
      const thresholds = [
        { level: 90, sent: alertRecord.threshold90Sent },
        { level: 70, sent: alertRecord.threshold70Sent },
        { level: 50, sent: alertRecord.threshold50Sent }
      ];

      for (const { level, sent } of thresholds) {
        if (percentageUsed >= level && !sent) {
          await sendEmail({
            to: budget.user.email,
            template: 'budget-alert',
            data: {
              userName: budget.user.name,
              percentageUsed,
              budgetAmount: Number(budget.amount),
              totalExpenses,
            },
          });

          // Update alert record
          await prisma.budgetAlert.update({
            where: { id: alertRecord.id },
            data: {
              [`threshold${level}Sent`]: true,
            },
          });

          // Update budget's lastAlertSent
          await prisma.budget.update({
            where: { id: budget.id },
            data: {
              lastAlertSent: new Date(),
            },
          });
        }
      }
    }

    return { success: true, message: 'Budget alerts checked and sent successfully' };
  } catch (error) {
    console.error('Error in checkBudgetAlerts:', error);
    throw error;
  }
} 