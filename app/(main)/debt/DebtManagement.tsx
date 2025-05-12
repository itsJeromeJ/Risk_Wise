"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DebtAnalysisForm from "@/components/DebtAnalysisform";
import DebtAnalysisResult from "@/components/DebtAnalysisResult";
import { CreateDebtDrawer } from "@/components/CreateDebt";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { startOfDay } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types for debt items
type DebtItem = {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  type: 'MORTGAGE' | 'CREDIT_CARD' | 'STUDENT_LOAN' | 'CAR_LOAN' | 'PERSONAL_LOAN' | 'OTHER';
  isRecurring?: boolean;
  recurringInterval?: string | null;
};

// Add new type for analysis result
type AnalysisResult = {
  isHighRisk: boolean;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  recommendations: string[];
  emi: number;
  debtToIncomeRatio: number;
  affordabilityRatio: number;
};

// Add the risk colors object
const riskColors = {
  veryLow: "#22c55e", // bright green
  low: "#10b981", // green
  medium: "#f59e0b", // yellow
  high: "#ef4444", // red
  veryHigh: "#dc2626", // bright red
  default: "#6b7280" // gray
};

const DebtManagement = () => {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [newDebt, setNewDebt] = useState<Partial<DebtItem>>({
    name: "",
    totalAmount: 0,
    remainingAmount: 0,
    interestRate: 0,
    minimumPayment: 0,
    dueDate: "",
    type: "OTHER",
    isRecurring: false,
    recurringInterval: null,
  });
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisUserData, setAnalysisUserData] = useState<any>(null);
  // Monthly income from database
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [lastIncomeUpdate, setLastIncomeUpdate] = useState<Date | null>(null);
  const [isEditingIncome, setIsEditingIncome] = useState<boolean>(false);
  const [incomeInputValue, setIncomeInputValue] = useState<string>("");

  // Calculate total debt and stats
  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(String(debt.remainingAmount)), 0);
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + parseFloat(String(debt.minimumPayment)), 0);
  const highestInterestDebt = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
  const netIncome = monthlyIncome * 0.8;

  // Calculate totals with proper values
  const totals = useMemo(() => {
    return {
      income: monthlyIncome,
      netIncome: netIncome,
      expense: totalMinimumPayment
    };
  }, [debts, monthlyIncome, netIncome, totalMinimumPayment]);
  
  // Calculate DTI ratio (Debt-to-Income) using industry standard approach
  // DTI = (Total Monthly Debt Payments / Gross Monthly Income) * 100
  // Financial institutions typically use gross income (pre-tax) for DTI calculations
  const grossMonthlyIncome = monthlyIncome; // Using the input monthly income as gross
  
  // Calculate total monthly debt obligations (all minimum payments)
  const totalMonthlyDebtPayments = totalMinimumPayment;
  
  // Standard DTI calculation with proper handling of edge cases
  const calculatedDTI = grossMonthlyIncome > 0 
    ? (totalMonthlyDebtPayments / grossMonthlyIncome) * 100 
    : totalMonthlyDebtPayments > 0 ? 100 : 0; // If there's debt but no income, DTI is 100%
    
  // Cap at 100% for display purposes
  const debtToIncomeRatio = Math.min(calculatedDTI, 100);
  
  // Format to 2 decimal places for precise financial reporting
  const formattedDTI = parseFloat(debtToIncomeRatio.toFixed(2));
  
  // Enhanced debug values for transparency
  console.log('DTI Calculation (DETAILED):', {
    grossMonthlyIncome,
    totalMonthlyDebtPayments,
    calculatedDTI,
    formattedDTI,
    debts: debts.map(d => ({
      name: d.name,
      minimumPayment: d.minimumPayment
    }))
  });

  // Enhanced risk assessment function that considers both DTI ratio and income level
  const getRiskLevel = (ratio: number, income: number | undefined) => {
    // Default income threshold values (can be adjusted)
    const LOW_INCOME = 2000;
    const MEDIUM_INCOME = 4000;
    const HIGH_INCOME = 8000;
    
    // If no income is provided, fall back to DTI ratio only
    if (!income || income <= 0) {
      if (ratio < 20) return { level: "Very Low", color: riskColors.veryLow };
      if (ratio < 30) return { level: "Low", color: riskColors.low };
      if (ratio < 40) return { level: "Moderate", color: riskColors.medium };
      if (ratio < 50) return { level: "High", color: riskColors.high };
      return { level: "Very High", color: riskColors.veryHigh };
    }
    
    // Adjust risk thresholds based on income level
    if (income < LOW_INCOME) {
      // Lower income means stricter DTI thresholds
      if (ratio < 15) return { level: "Low", color: riskColors.low };
      if (ratio < 25) return { level: "Moderate", color: riskColors.medium };
      if (ratio < 35) return { level: "High", color: riskColors.high };
      return { level: "Very High", color: riskColors.veryHigh };
    } else if (income < MEDIUM_INCOME) {
      // Medium-low income
      if (ratio < 20) return { level: "Low", color: riskColors.low };
      if (ratio < 30) return { level: "Moderate", color: riskColors.medium };
      if (ratio < 40) return { level: "High", color: riskColors.high };
      return { level: "Very High", color: riskColors.veryHigh };
    } else if (income < HIGH_INCOME) {
      // Medium-high income
      if (ratio < 25) return { level: "Very Low", color: riskColors.veryLow };
      if (ratio < 35) return { level: "Low", color: riskColors.low };
      if (ratio < 45) return { level: "Moderate", color: riskColors.medium };
      return { level: "High", color: riskColors.high };
    } else {
      // High income can handle higher DTI ratios
      if (ratio < 30) return { level: "Very Low", color: riskColors.veryLow };
      if (ratio < 40) return { level: "Low", color: riskColors.low };
      if (ratio < 50) return { level: "Moderate", color: riskColors.medium };
      return { level: "High", color: riskColors.high };
    }
  };

  const riskAssessment = getRiskLevel(formattedDTI, monthlyIncome);

  // Add recurring debt functionality
  const handleAddDebt = () => {
    if (!newDebt.name || !newDebt.remainingAmount) return;

    const newDebtItem: DebtItem = {
      id: Date.now().toString(),
      name: newDebt.name || "",
      totalAmount: newDebt.totalAmount || newDebt.remainingAmount || 0,
      remainingAmount: newDebt.remainingAmount || 0,
      interestRate: newDebt.interestRate || 0,
      minimumPayment: newDebt.minimumPayment || 0,
      dueDate: newDebt.dueDate || new Date().toISOString().split('T')[0],
      type: newDebt.type as any || "OTHER",
      isRecurring: newDebt.isRecurring || false,
      recurringInterval: newDebt.recurringInterval || null,
    };

    setDebts([...debts, newDebtItem]);
    setNewDebt({
      name: "",
      totalAmount: 0,
      remainingAmount: 0,
      interestRate: 0,
      minimumPayment: 0,
      dueDate: "",
      type: "OTHER",
      isRecurring: false,
      recurringInterval: null,
    });
  };

  // New function to calculate EMI
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = (rate / 12) / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  };

  // New function to analyze debt risk
  const analyzeDebtRisk = async (formData: any) => {
    const emi = calculateEMI(formData.loanAmount, formData.interestRate, formData.loanTenureMonths);
    const totalMonthlyDebt = formData.existingEMIs + emi;
    const dti = (totalMonthlyDebt / formData.monthlyIncome) * 100;
    const affordabilityRatio = ((formData.monthlyIncome - totalMonthlyDebt - formData.monthlyExpenses) / formData.monthlyIncome) * 100;
    
    // Calculate risk score based on multiple factors
    const dtiScore = Math.max(0, 100 - (dti * 2));
    const affordabilityScore = affordabilityRatio;
    const creditScore = (formData.creditScore - 300) / 6;
    
    const riskScore = Math.round((dtiScore * 0.4) + (affordabilityScore * 0.3) + (creditScore * 0.3));
    
    let recommendations: string[] = [];
    
    try {
      // Get AI-generated recommendations
      const aiResponse = await fetch('/api/analysis/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emi,
          debtToIncomeRatio: Math.round(dti * 10) / 10,
          affordabilityRatio: Math.round(affordabilityRatio * 10) / 10,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        recommendations = aiData.recommendations;
      } else {
        throw new Error('Failed to get AI recommendations');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast.error('Could not generate personalized recommendations');
      // Fallback recommendations
      recommendations = [
        dti > 40 ? "Your debt-to-income ratio is high. Consider reducing existing debts before taking on new loans." : "Your debt-to-income ratio is within acceptable limits.",
        affordabilityRatio < 30 ? "Your disposable income after this loan would be limited. Consider a smaller loan amount or longer tenure." : "Your affordability ratio looks healthy.",
        formData.creditScore < 650 ? "Your credit score indicates higher risk. Work on improving your credit score for better loan terms." : "Your credit score is favorable for loan approval.",
      ];
    }
    
    return {
      isHighRisk: riskScore < 40,
      riskScore,
      riskLevel: riskScore < 30 ? 'Low' : riskScore < 50 ? 'Moderate' : riskScore < 70 ? 'High' : 'Very High',
      recommendations,
      emi,
      debtToIncomeRatio: Math.round(dti * 10) / 10,
      affordabilityRatio: Math.round(affordabilityRatio * 10) / 10
    };
  };

  const handleAnalysisSubmit = async (formData: any) => {
    try {
      const result = await analyzeDebtRisk(formData);
      if (!result.recommendations || !Array.isArray(result.recommendations)) {
        // Provide default recommendations if none are returned
        result.recommendations = [
          "Consider your current debt-to-income ratio when taking on new debt.",
          "Review your monthly budget to ensure comfortable loan payments.",
          "Monitor your credit score to qualify for better interest rates."
        ];
      }
      setAnalysisResult(result as AnalysisResult);
      setAnalysisUserData(formData);
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error('Failed to complete loan analysis');
    }
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setAnalysisUserData(null);
  };
  
  // Handle editing a debt
  const handleEditDebt = (debt: DebtItem) => {
    setEditingDebt(debt);
    setIsEditDialogOpen(true);
  };
  
  // Add recurring fields to the edit dialog
  const handleSaveEdit = () => {
    if (!editingDebt) return;

    const updatedDebts = debts.map(debt => 
      debt.id === editingDebt.id ? { ...editingDebt, isRecurring: editingDebt.isRecurring, recurringInterval: editingDebt.recurringInterval } : debt
    );

    setDebts(updatedDebts);
    setIsEditDialogOpen(false);
    setEditingDebt(null);
    toast.success("Debt updated successfully");
  };
  
  // Handle deleting a debt
  const handleDeleteDebt = (id: string) => {
    if (confirm("Are you sure you want to delete this debt?")) {
      const updatedDebts = debts.filter(debt => debt.id !== id);
      setDebts(updatedDebts);
      toast.success("Debt deleted successfully");
      
      // In a real app, you would delete from the backend here
      // deleteDebtFromBackend(id);
    }
  };

  const fetchDebts = async () => {
    try {
      const response = await fetch('/api/debts');
      if (!response.ok) {
        throw new Error('Failed to fetch debts');
      }
      const data = await response.json();
      // Convert Decimal strings to numbers and format them properly
      const formattedData = data.map(debt => ({
        ...debt,
        totalAmount: parseFloat(debt.totalAmount),
        remainingAmount: parseFloat(debt.remainingAmount),
        interestRate: parseFloat(debt.interestRate),
        minimumPayment: parseFloat(debt.minimumPayment)
      }));
      setDebts(formattedData);
    } catch (error) {
      console.error('Error fetching debts:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const response = await fetch('/api/stats/monthly');
      if (!response.ok) {
        throw new Error('Failed to fetch monthly stats');
      }
      const data = await response.json();
      // Update monthly income from database
      setMonthlyIncome(data.totalIncome);
      setIncomeInputValue(data.totalIncome.toString());
      setLastIncomeUpdate(new Date());
      toast.success('Income data updated from dashboard');
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      toast.error('Please enter your income manually', {
        description: 'Income data could not be loaded from the server'
      });
      // Prompt user to enter income manually
      setIsEditingIncome(true);
    }
  };
  
  // Handle manual income update
  const handleIncomeUpdate = () => {
    const parsedIncome = parseFloat(incomeInputValue);
    if (!isNaN(parsedIncome) && parsedIncome >= 0) {
      setMonthlyIncome(parsedIncome);
      setLastIncomeUpdate(new Date());
      setIsEditingIncome(false);
      
      // Recalculate DTI immediately with the new income value
      // This is handled automatically by React since the DTI calculation
      // depends on monthlyIncome which we just updated
      
      toast.success('Income updated successfully');
    } else {
      toast.error('Please enter a valid income amount');
    }
  };
  
  // Handle income input change
  const handleIncomeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setIncomeInputValue(value);
  };
  
  // Handle keyboard events for income input
  const handleIncomeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleIncomeUpdate();
    } else if (e.key === 'Escape') {
      setIsEditingIncome(false);
    }
  };

  useEffect(() => {
    // Fetch debts and monthly stats on component mount
    fetchDebts();
    
    // Try to fetch monthly stats, but don't block the UI if it fails
    fetchMonthlyStats().catch(() => {
      // If fetching stats fails on initial load, prompt user to enter income
      // This is a fallback in case the API is not available
      setIsEditingIncome(true);
    });
  }, []);
  
  // Set income input value when monthlyIncome changes
  useEffect(() => {
    setIncomeInputValue(monthlyIncome.toString());
  }, [monthlyIncome]);

  return (
    <div className="px-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Debt Card */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Total Debt</span>
              </div>
              <div className="text-3xl font-bold">
                ${new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalDebt)}
              </div>
              <p className="text-sm text-gray-500">Across {debts.length} accounts</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Payment Card */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Monthly Payment</span>
              </div>
              <div className="text-3xl font-bold">
                ${new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(totalMinimumPayment)}
              </div>
              <p className="text-sm text-gray-500">Minimum required payments</p>
            </div>
          </CardContent>
        </Card>

        {/* Updated Debt Risk Level Card */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <AlertTriangle 
                  className="h-5 w-5" 
                  style={{ color: riskAssessment.color }} 
                />
                <span className="text-sm text-gray-600">Debt Risk Level</span>
              </div>
              <div className="text-3xl font-bold flex items-center gap-2">
                {monthlyIncome > 0 ? (
                  <>
                    {riskAssessment.level}
                    <span 
                      className="text-sm px-2 py-1 rounded-full" 
                      style={{ 
                        backgroundColor: `${riskAssessment.color}15`,
                        color: riskAssessment.color
                      }}
                    >
                      {formattedDTI}%
                    </span>
                  </>
                ) : (
                  <span className="text-base text-amber-500">Enter income to calculate</span>
                )}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Monthly Income:</span>
                  <div className="flex items-center">
                    {isEditingIncome ? (
                      <div className="flex items-center">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="text"
                            value={incomeInputValue}
                            onChange={handleIncomeInputChange}
                            onKeyDown={handleIncomeKeyDown}
                            className="pl-6 h-7 w-28 text-sm"
                            placeholder="Enter income"
                            autoFocus
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 ml-1 px-2" 
                          onClick={handleIncomeUpdate}
                          title="Save income"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        {monthlyIncome > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2" 
                            onClick={() => setIsEditingIncome(false)}
                            title="Cancel"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                              <path d="M18 6 6 18"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <>
                        {monthlyIncome > 0 ? (
                          <>
                            <span className="text-sm font-semibold">
                              ${new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(monthlyIncome)}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 ml-1 px-2" 
                              onClick={() => {
                                setIsEditingIncome(true);
                                setIncomeInputValue(monthlyIncome.toString());
                              }}
                              title="Edit income"
                            >
                              <Edit className="h-3 w-3 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2" 
                              onClick={fetchMonthlyStats}
                              title="Refresh income data"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                <path d="M21 3v5h-5"/>
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                <path d="M3 21v-5h5"/>
                              </svg>
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setIsEditingIncome(true)}
                          >
                            Enter Income
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {lastIncomeUpdate && !isEditingIncome && monthlyIncome > 0 && (
                  <p className="text-xs text-gray-500">
                    Updated: {lastIncomeUpdate.toLocaleTimeString()} {lastIncomeUpdate.toLocaleDateString()}
                  </p>
                )}
                {!lastIncomeUpdate && !isEditingIncome && monthlyIncome === 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Please enter your income to calculate debt-to-income ratio
                  </p>
                )}
              </div>
              {monthlyIncome > 0 && (
                <Progress 
                  value={formattedDTI} 
                  max={100} 
                  style={{
                    backgroundColor: `${riskAssessment.color}15`,
                    "--progress-color": riskAssessment.color
                  } as React.CSSProperties}
                  className="h-2 mt-2 [&>div]:bg-[var(--progress-color)]"
                />
              )}
              
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-4 mt-6">
          <Tabs defaultValue="overview" className="space-y-5">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Current Debts</TabsTrigger>
              <TabsTrigger value="analysis">Loan Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="bg-white">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-3xl font-bold">Your Debt Accounts</CardTitle>
                  <CardDescription className="text-gray-500">Manage all your debt in one place</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {debts.map(debt => (
                      <div key={debt.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{debt.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">
                              ${debt.remainingAmount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                onClick={() => handleEditDebt(debt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                                onClick={() => handleDeleteDebt(debt.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Progress 
                          value={(debt.remainingAmount / debt.totalAmount) * 100} 
                          className="h-2 mb-2"
                        />
                        
                        <div className="text-sm text-gray-500">
                          <div className="flex justify-between mb-1">
                            <span>Paid: ${(debt.totalAmount - debt.remainingAmount).toLocaleString()}</span>
                            <span>Total: ${debt.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Interest</p>
                            <p className="font-medium">{debt.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monthly</p>
                            <p className="font-medium">${debt.minimumPayment}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Due Date</p>
                            <p className="font-medium">{new Date(debt.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <CreateDebtDrawer>
                      <Button variant="default" size="default" className="mt-6">Add Debt</Button>
                    </CreateDebtDrawer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="space-y-4">
                {!analysisResult ? (
                  <DebtAnalysisForm 
                    onSubmit={handleAnalysisSubmit} 
                    initialDebts={debts} 
                  />
                ) : (
                  <DebtAnalysisResult
                    result={analysisResult}
                    userData={analysisUserData}
                    onReset={handleResetAnalysis}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="strategies">
              <Card className="bg-white">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold">AI-Recommended Repayment Strategy</CardTitle>
                  <CardDescription className="text-gray-500">
                    Optimized approach to become debt-free faster
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-6">
                    <div className="p-4 border rounded-md bg-blue-50">
                      <h3 className="font-semibold mb-2">Optimized Repayment Plan</h3>
                      <div className="space-y-3">
                        {analysisResult ? (
                          <>
                            <p className="text-sm">
                              With your new loan analysis (Risk Level: {analysisResult.riskLevel}):
                            </p>
                            <ul className="list-disc pl-5 text-sm space-y-2">
                              {analysisResult.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="text-sm">
                            Complete a loan analysis to receive personalized recommendations.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
    
    {/* Edit Debt Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Debt</DialogTitle>
          <DialogDescription>
            Make changes to your debt information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {editingDebt && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editingDebt.name}
                onChange={(e) => setEditingDebt({...editingDebt, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalAmount" className="text-right">
                Total Amount
              </Label>
              <Input
                id="totalAmount"
                type="number"
                value={editingDebt.totalAmount}
                onChange={(e) => setEditingDebt({...editingDebt, totalAmount: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remainingAmount" className="text-right">
                Remaining
              </Label>
              <Input
                id="remainingAmount"
                type="number"
                value={editingDebt.remainingAmount}
                onChange={(e) => setEditingDebt({...editingDebt, remainingAmount: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interestRate" className="text-right">
                Interest Rate
              </Label>
              <Input
                id="interestRate"
                type="number"
                value={editingDebt.interestRate}
                onChange={(e) => setEditingDebt({...editingDebt, interestRate: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minimumPayment" className="text-right">
                Monthly Payment
              </Label>
              <Input
                id="minimumPayment"
                type="number"
                value={editingDebt.minimumPayment}
                onChange={(e) => setEditingDebt({...editingDebt, minimumPayment: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={editingDebt.dueDate}
                onChange={(e) => setEditingDebt({...editingDebt, dueDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select 
                value={editingDebt.type} 
                onValueChange={(value) => setEditingDebt({...editingDebt, type: value as DebtItem['type']})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select debt type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="STUDENT_LOAN">Student Loan</SelectItem>
                  <SelectItem value="CAR_LOAN">Car Loan</SelectItem>
                  <SelectItem value="PERSONAL_LOAN">Personal Loan</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isRecurring" className="text-right">
                Recurring
              </Label>
              <Select 
                value={editingDebt.isRecurring ? "true" : "false"} 
                onValueChange={(value) => setEditingDebt({...editingDebt, isRecurring: value === "true"})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select recurring status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingDebt.isRecurring && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurringInterval" className="text-right">
                  Interval
                </Label>
                <Input
                  id="recurringInterval"
                  value={editingDebt.recurringInterval || ""}
                  onChange={(e) => setEditingDebt({...editingDebt, recurringInterval: e.target.value})}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default DebtManagement;
