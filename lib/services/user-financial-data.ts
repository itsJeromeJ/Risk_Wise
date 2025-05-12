'use strict';



export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: 'credit_card' | 'student_loan' | 'mortgage' | 'personal_loan' | 'auto_loan' | 'other';
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface UserFinancialData {
  userId: string;
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  savingsGoals: {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
  }[];
  netWorth: {
    assets: number;
    liabilities: number;
    total: number;
  };
  incomeStreams: {
    id: string;
    name: string;
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  }[];
}

export class UserFinancialDataService {
  private static instance: UserFinancialDataService;
  private userFinancialData: Map<string, UserFinancialData> = new Map();

  private constructor() {
    // Initialize with sample data for demo purposes
    this.initializeSampleData();
  }

  public static getInstance(): UserFinancialDataService {
    if (!UserFinancialDataService.instance) {
      UserFinancialDataService.instance = new UserFinancialDataService();
    }
    return UserFinancialDataService.instance;
  }

  private initializeSampleData() {
    const sampleData: UserFinancialData = {
      userId: 'user123',
      transactions: [
        {
          id: 't1',
          date: '2023-05-01',
          amount: 2500,
          category: 'Income',
          description: 'Salary',
          type: 'income'
        },
        {
          id: 't2',
          date: '2023-05-02',
          amount: 85.75,
          category: 'Groceries',
          description: 'Whole Foods',
          type: 'expense'
        },
        {
          id: 't3',
          date: '2023-05-03',
          amount: 12.99,
          category: 'Subscription',
          description: 'Netflix',
          type: 'expense'
        },
        {
          id: 't4',
          date: '2023-05-05',
          amount: 45.00,
          category: 'Dining',
          description: 'Restaurant',
          type: 'expense'
        },
        {
          id: 't5',
          date: '2023-05-10',
          amount: 150.00,
          category: 'Utilities',
          description: 'Electricity Bill',
          type: 'expense'
        },
        {
          id: 't6',
          date: '2023-05-15',
          amount: 1200.00,
          category: 'Housing',
          description: 'Rent',
          type: 'expense'
        },
        {
          id: 't7',
          date: '2023-05-20',
          amount: 35.00,
          category: 'Entertainment',
          description: 'Movie tickets',
          type: 'expense'
        },
        {
          id: 't8',
          date: '2023-05-25',
          amount: 500.00,
          category: 'Savings',
          description: 'Transfer to savings',
          type: 'expense'
        }
      ],
      debts: [
        {
          id: 'd1',
          name: 'Credit Card',
          totalAmount: 5000,
          remainingAmount: 3500,
          interestRate: 18.99,
          minimumPayment: 150,
          dueDate: '2023-06-15',
          type: 'credit_card'
        },
        {
          id: 'd2',
          name: 'Student Loan',
          totalAmount: 25000,
          remainingAmount: 15000,
          interestRate: 4.5,
          minimumPayment: 250,
          dueDate: '2023-06-01',
          type: 'student_loan'
        },
        {
          id: 'd3',
          name: 'Car Loan',
          totalAmount: 20000,
          remainingAmount: 12000,
          interestRate: 3.9,
          minimumPayment: 350,
          dueDate: '2023-06-10',
          type: 'auto_loan'
        }
      ],
      budgets: [
        {
          id: 'b1',
          category: 'Groceries',
          allocated: 400,
          spent: 250,
          remaining: 150,
          period: 'monthly'
        },
        {
          id: 'b2',
          category: 'Dining',
          allocated: 200,
          spent: 150,
          remaining: 50,
          period: 'monthly'
        },
        {
          id: 'b3',
          category: 'Entertainment',
          allocated: 100,
          spent: 85,
          remaining: 15,
          period: 'monthly'
        },
        {
          id: 'b4',
          category: 'Transportation',
          allocated: 150,
          spent: 120,
          remaining: 30,
          period: 'monthly'
        }
      ],
      savingsGoals: [
        {
          id: 'sg1',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 5000,
          targetDate: '2023-12-31'
        },
        {
          id: 'sg2',
          name: 'Vacation',
          targetAmount: 3000,
          currentAmount: 1500,
          targetDate: '2023-08-31'
        }
      ],
      netWorth: {
        assets: 50000,
        liabilities: 30500,
        total: 19500
      },
      incomeStreams: [
        {
          id: 'is1',
          name: 'Primary Job',
          amount: 5000,
          frequency: 'monthly'
        },
        {
          id: 'is2',
          name: 'Side Gig',
          amount: 500,
          frequency: 'monthly'
        }
      ]
    };

    this.userFinancialData.set('user123', sampleData);
  }

  public getUserFinancialData(userId: string): UserFinancialData | null {
    console.log("getUserFinancialData called with userId:", userId);
    console.log("Data returned:", this.userFinancialData.get(userId));
    return this.userFinancialData.get(userId) || null;
  }

  public getTransactions(userId: string, limit: number = 10): Transaction[] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    
    // Sort transactions by date (most recent first) and limit the results
    return [...userData.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  public getDebts(userId: string): Debt[] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    return userData.debts;
  }

  public getBudgets(userId: string): Budget[] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    return userData.budgets;
  }

  public getSavingsGoals(userId: string): UserFinancialData['savingsGoals'] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    return userData.savingsGoals;
  }

  public getNetWorth(userId: string): UserFinancialData['netWorth'] | null {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return null;
    return userData.netWorth;
  }

  public getIncomeStreams(userId: string): UserFinancialData['incomeStreams'] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    return userData.incomeStreams;
  }

  // Analysis methods
  public getSpendingByCategory(userId: string): Record<string, number> {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return {};
    
    const spendingByCategory: Record<string, number> = {};
    
    userData.transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (!spendingByCategory[transaction.category]) {
          spendingByCategory[transaction.category] = 0;
        }
        spendingByCategory[transaction.category] += transaction.amount;
      });
    
    return spendingByCategory;
  }

  public getDebtSummary(userId: string): {
    totalDebt: number;
    highestInterestDebt: Debt | null;
    monthlyDebtPayments: number;
  } {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return { totalDebt: 0, highestInterestDebt: null, monthlyDebtPayments: 0 };
    
    const debts = userData.debts;
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const monthlyDebtPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    
    let highestInterestDebt: Debt | null = null;
    let highestRate = 0;
    
    debts.forEach(debt => {
      if (debt.interestRate > highestRate) {
        highestRate = debt.interestRate;
        highestInterestDebt = debt;
      }
    });
    
    return {
      totalDebt,
      highestInterestDebt,
      monthlyDebtPayments
    };
  }

  public getIncomeVsExpenses(userId: string): {
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    savingsRate: number;
  } {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return { totalIncome: 0, totalExpenses: 0, netCashFlow: 0, savingsRate: 0 };
    
    const transactions = userData.transactions;
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      savingsRate
    };
  }

  public getBudgetHealth(userId: string): {
    onTrack: Budget[];
    overBudget: Budget[];
    utilizationRate: number;
  } {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return { onTrack: [], overBudget: [], utilizationRate: 0 };
    
    const budgets = userData.budgets;
    
    const onTrack = budgets.filter(b => b.spent <= b.allocated);
    const overBudget = budgets.filter(b => b.spent > b.allocated);
    
    const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    
    return {
      onTrack,
      overBudget,
      utilizationRate
    };
  }

  // Financial recommendations
  public generateFinancialInsights(userId: string): string[] {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return [];
    
    const insights: string[] = [];
    
    // Debt insights
    const debtSummary = this.getDebtSummary(userId);
    if (debtSummary.highestInterestDebt) {
      insights.push(`Your highest interest debt is your ${debtSummary.highestInterestDebt.name} at ${debtSummary.highestInterestDebt.interestRate}%. Consider prioritizing this for repayment.`);
    }
    
    if (debtSummary.totalDebt > 0) {
      const debtToIncomeRatio = debtSummary.totalDebt / (this.getMonthlyIncome(userId) * 12);
      if (debtToIncomeRatio > 0.36) {
        insights.push(`Your debt-to-income ratio is ${(debtToIncomeRatio * 100).toFixed(1)}%, which is higher than the recommended 36%. Consider strategies to reduce your debt.`);
      }
    }
    
    // Budget insights
    const budgetHealth = this.getBudgetHealth(userId);
    if (budgetHealth.overBudget.length > 0) {
      const categories = budgetHealth.overBudget.map(b => b.category).join(', ');
      insights.push(`You're currently over budget in these categories: ${categories}. Consider adjusting your spending or reallocating your budget.`);
    }
    
    if (budgetHealth.utilizationRate > 90) {
      insights.push(`You've used ${budgetHealth.utilizationRate.toFixed(1)}% of your total budget. You may need to be careful with spending for the rest of the period.`);
    }
    
    // Savings insights
    const incomeVsExpenses = this.getIncomeVsExpenses(userId);
    if (incomeVsExpenses.savingsRate < 20) {
      insights.push(`Your current savings rate is ${incomeVsExpenses.savingsRate.toFixed(1)}%. Financial experts often recommend saving at least 20% of your income.`);
    }
    
    // Emergency fund check
    const emergencyFund = userData.savingsGoals.find(g => g.name.toLowerCase().includes('emergency'));
    if (emergencyFund) {
      const monthlyExpenses = incomeVsExpenses.totalExpenses;
      const monthsCovered = emergencyFund.currentAmount / monthlyExpenses;
      
      if (monthsCovered < 3) {
        insights.push(`Your emergency fund covers approximately ${monthsCovered.toFixed(1)} months of expenses. Consider building this to 3-6 months for better financial security.`);
      }
    } else {
      insights.push("You don't appear to have a dedicated emergency fund. Consider starting one with a goal of 3-6 months of living expenses.");
    }
    
    return insights;
  }

  private getMonthlyIncome(userId: string): number {
    const userData = this.userFinancialData.get(userId);
    if (!userData) return 0;
    
    let monthlyIncome = 0;
    
    userData.incomeStreams.forEach(stream => {
      switch (stream.frequency) {
        case 'weekly':
          monthlyIncome += stream.amount * 4.33; // Average weeks in a month
          break;
        case 'biweekly':
          monthlyIncome += stream.amount * 2.17; // Average bi-weekly periods in a month
          break;
        case 'monthly':
          monthlyIncome += stream.amount;
          break;
        case 'yearly':
          monthlyIncome += stream.amount / 12;
          break;
      }
    });
    
    return monthlyIncome;
  }
}

