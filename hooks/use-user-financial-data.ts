'use client'

import { useState, useEffect } from 'react';
import { 
  UserFinancialDataService, 
  Transaction, 
  Debt, 
  Budget,
  UserFinancialData
} from '@/lib/services/user-financial-data';

interface UseUserFinancialDataOptions {
  userId: string;
}

export function useUserFinancialData({ userId }: UseUserFinancialDataOptions) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<UserFinancialData | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get the singleton instance of the service
        const service = UserFinancialDataService.getInstance();
        
        // Fetch the user's financial data
        const userData = service.getUserFinancialData(userId);
        
        if (!userData) {
          throw new Error(`No financial data found for user ${userId}`);
        }
        
        // Generate financial insights
        const userInsights = service.generateFinancialInsights(userId);
        
        setData(userData);
        setInsights(userInsights);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error fetching user financial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Function to get spending by category
  const getSpendingByCategory = () => {
    if (!data) return {};
    
    const service = UserFinancialDataService.getInstance();
    return service.getSpendingByCategory(userId);
  };

  // Function to get debt summary
  const getDebtSummary = () => {
    if (!data) return { totalDebt: 0, highestInterestDebt: null, monthlyDebtPayments: 0 };
    
    const service = UserFinancialDataService.getInstance();
    return service.getDebtSummary(userId);
  };

  // Function to get income vs expenses
  const getIncomeVsExpenses = () => {
    if (!data) return { totalIncome: 0, totalExpenses: 0, netCashFlow: 0, savingsRate: 0 };
    
    const service = UserFinancialDataService.getInstance();
    return service.getIncomeVsExpenses(userId);
  };

  // Function to get budget health
  const getBudgetHealth = () => {
    if (!data) return { onTrack: [], overBudget: [], utilizationRate: 0 };
    
    const service = UserFinancialDataService.getInstance();
    return service.getBudgetHealth(userId);
  };

  return {
    isLoading,
    error,
    data,
    insights,
    getSpendingByCategory,
    getDebtSummary,
    getIncomeVsExpenses,
    getBudgetHealth
  };
}