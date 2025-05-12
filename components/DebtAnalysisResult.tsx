import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, PieChart, Cell } from "recharts";
import { Calculator, Coins, AlertCircle, Check, X, FileChartPie, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AnalysisResult {
  isHighRisk: boolean;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  recommendations: string[];
  emi: number;
  debtToIncomeRatio: number;
  affordabilityRatio: number;
}

interface UserData {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEMIs: number;
  loanAmount: number;
  loanTenureMonths: number;
  interestRate: number;
  creditScore: number;
}

interface DebtAnalysisResultProps {
  result: AnalysisResult;
  onReset: () => void;
  userData: UserData;
}

const DebtAnalysisResult = ({ result, onReset, userData }: DebtAnalysisResultProps) => {
  // Calculate total DTI including new loan
  const calculateTotalDTI = () => {
    const totalMonthlyDebt = userData.existingEMIs + result.emi;
    return (totalMonthlyDebt / userData.monthlyIncome) * 100;
  };

  // Calculate comprehensive risk score based on multiple factors
  const calculateRiskScore = () => {
    // Recalculate DTI with new loan included
    const totalDTI = calculateTotalDTI();

    // 1. DTI (Debt-to-Income) Risk - 40% weight
    const dtiRisk = (() => {
      if (totalDTI <= 20) return 0;
      if (totalDTI <= 30) return 25;
      if (totalDTI <= 40) return 50;
      if (totalDTI <= 50) return 75;
      return 100;
    })();

    // 2. Affordability Risk - 30% weight
    const affordabilityRisk = (() => {
      const ratio = result.affordabilityRatio;
      if (ratio >= 50) return 0;
      if (ratio >= 40) return 25;
      if (ratio >= 30) return 50;
      if (ratio >= 20) return 75;
      return 100;
    })();

    // 3. Loan Amount to Income Ratio - 20% weight
    const loanToIncomeRisk = (() => {
      const annualIncome = userData.monthlyIncome * 12;
      const ratio = (userData.loanAmount / annualIncome) * 100;
      if (ratio <= 100) return 0;    // Loan less than 1x annual income
      if (ratio <= 200) return 25;   // Loan less than 2x annual income
      if (ratio <= 300) return 50;   // Loan less than 3x annual income
      if (ratio <= 400) return 75;   // Loan less than 4x annual income
      return 100;                    // Loan more than 4x annual income
    })();

    // 4. Credit Score Risk - 10% weight
    const creditScoreRisk = (() => {
      const score = userData.creditScore;
      if (score >= 800) return 0;
      if (score >= 700) return 25;
      if (score >= 600) return 50;
      if (score >= 500) return 75;
      return 100;
    })();

    // Calculate weighted average
    const weightedScore = (
      (dtiRisk * 0.4) +
      (affordabilityRisk * 0.3) +
      (loanToIncomeRisk * 0.2) +
      (creditScoreRisk * 0.1)
    );

    return Math.round(weightedScore);
  };

  const riskScore = calculateRiskScore();

  // Risk level thresholds and colors
  const riskLevels = {
    'Low': { 
      color: '#22c55e',
      threshold: 25,
      description: 'Your debt profile is healthy and the loan appears very manageable.'
    },
    'Moderate': { 
      color: '#f97316',
      threshold: 50,
      description: 'The loan is manageable but requires careful financial planning.'
    },
    'High': { 
      color: '#ef4444',
      threshold: 75,
      description: 'This loan carries significant risk. Consider reducing the loan amount or improving other factors.'
    },
    'Very High': { 
      color: '#7f1d1d',
      threshold: 100,
      description: 'Taking this loan could put you under severe financial stress.'
    }
  };

  // Get risk level based on score
  const getRiskLevel = (score: number) => {
    if (score <= riskLevels['Low'].threshold) return 'Low';
    if (score <= riskLevels['Moderate'].threshold) return 'Moderate';
    if (score <= riskLevels['High'].threshold) return 'High';
    return 'Very High';
  };

  const currentRiskLevel = getRiskLevel(riskScore);

  // Generate detailed analysis text
  const getDetailedAnalysis = () => {
    const factors = [];
    
    // DTI Analysis
    if (result.debtToIncomeRatio > 40) {
      factors.push("Your debt-to-income ratio is significantly high");
    } else if (result.debtToIncomeRatio > 30) {
      factors.push("Your debt-to-income ratio is approaching the recommended limit");
    }

    // Affordability Analysis
    if (result.affordabilityRatio < 30) {
      factors.push("Your disposable income after this loan would be limited");
    }

    // Loan Size Analysis
    const annualIncome = userData.monthlyIncome * 12;
    const loanToIncomeRatio = (userData.loanAmount / annualIncome) * 100;
    if (loanToIncomeRatio > 300) {
      factors.push("The loan amount is high relative to your annual income");
    }

    return factors;
  };

  // Format currency with 2 decimal places
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage with one decimal place
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Generate data for payment over time chart
  const generatePaymentData = () => {
    const data = [];
    let remainingAmount = userData.loanAmount;
    const monthlyPayment = result.emi;
    const monthlyRate = userData.interestRate / 12 / 100;

    for (let month = 0; month <= userData.loanTenureMonths; month += 3) {
      if (month === 0) {
        data.push({
          month,
          remainingBalance: remainingAmount,
        });
        continue;
      }

      // Calculate interest and principal components of the payment
      const interestForPeriod = remainingAmount * monthlyRate;
      const principalForPeriod = monthlyPayment - interestForPeriod;
      
      // Update remaining amount
      remainingAmount = Math.max(0, remainingAmount - principalForPeriod);
      
      data.push({
        month,
        remainingBalance: parseFloat(remainingAmount.toFixed(2)),
      });
    }

    return data;
  };

  // Generate data for monthly budget breakdown
  const generateBudgetData = () => {
    return [
      { name: "Expenses", value: userData.monthlyExpenses, color: "#94a3b8" },
      { name: "Existing EMIs", value: userData.existingEMIs, color: "#64748b" },
      { name: "New EMI", value: result.emi, color: "#0ea5e9" },
      { name: "Remaining", value: userData.monthlyIncome - userData.monthlyExpenses - userData.existingEMIs - result.emi, color: "#22c55e" }
    ];
  };

  // Get color based on DTI value
  const getDTIColor = (dti: number) => {
    if (dti <= 30) return 'text-green-600';
    if (dti <= 40) return 'text-orange-500';
    return 'text-red-600';
  };

  // Calculate current DTI with new loan
  const currentTotalDTI = calculateTotalDTI();

  // Get DTI status message
  const getDTIStatus = (dti: number) => {
    if (dti <= 30) return "Healthy: Within safe limits";
    if (dti <= 40) return "Caution: Approaching maximum recommended";
    return "Warning: Exceeds recommended limit";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card className="bg-white shadow-md">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileChartPie className="h-6 w-6 text-primary" />
                Debt Analysis Results
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Comprehensive analysis based on your financial profile
              </CardDescription>
            </div>
            <Badge 
              variant={riskScore > 50 ? "destructive" : "outline"}
              className={`text-sm px-4 py-1.5 self-start md:self-center
                ${riskScore > 75 ? 'bg-red-700' : 
                  riskScore > 50 ? 'bg-red-500' : 
                  riskScore > 25 ? 'bg-orange-500' : 'bg-green-500'}`}
            >
              {currentRiskLevel} Risk
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Risk Score Meter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Risk Assessment Score</h3>
              {/* <span className="font-semibold">{riskScore}/100</span> */}
            </div>
            <div className="relative">
              <Progress 
                value={riskScore} 
                className="h-2.5" 
                style={{
                  '--progress-background': riskLevels[currentRiskLevel].color
                } as React.CSSProperties} 
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Safe (0-25)</span>
                <span>Moderate (26-50)</span>
                <span>High (51-75)</span>
                <span>Critical (76-100)</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {riskLevels[currentRiskLevel].description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly EMI */}
            <Card className="bg-gray-50/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Coins className="h-5 w-5" />
                  <h3 className="font-medium">Monthly EMI</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{formatCurrency(result.emi)}</span>
                    <span className="text-sm text-gray-500">
                      {((result.emi / userData.monthlyIncome) * 100).toFixed(1)}% of income
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    New monthly payment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Debt-to-Income Ratio */}
            <Card className="bg-gray-50/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calculator className="h-5 w-5" />
                  <h3 className="font-medium">Total Debt-to-Income</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getDTIColor(currentTotalDTI)}`}>
                      {formatPercent(currentTotalDTI)}
                    </span>
                    <span className="text-sm text-gray-500">
                      (+{formatPercent((result.emi / userData.monthlyIncome) * 100)} new)
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">
                      {getDTIStatus(currentTotalDTI)}
                    </p>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>Existing: {formatPercent((userData.existingEMIs / userData.monthlyIncome) * 100)}</span>
                      <span>•</span>
                      <span>New: {formatPercent((result.emi / userData.monthlyIncome) * 100)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disposable Income */}
            <Card className="bg-gray-50/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center 
                    ${result.affordabilityRatio > 30 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.affordabilityRatio > 30 ? <Check /> : <X />}
                  </div>
                  <h3 className="font-medium">Disposable Income</h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatPercent(result.affordabilityRatio)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(userData.monthlyIncome - userData.monthlyExpenses - userData.existingEMIs - result.emi)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {result.affordabilityRatio < 20 
                      ? "Critically low disposable income" 
                      : result.affordabilityRatio < 30 
                        ? "Limited disposable income" 
                        : "Healthy disposable income"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="border-t pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
              {/* Loan Balance Projection */}
              <Card className="p-6 shadow-sm">
                <h3 className="font-medium mb-6">Loan Balance Projection</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={generatePaymentData()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="#e5e7eb" 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="month" 
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        label={{ 
                          value: 'Months', 
                          position: 'bottom', 
                          offset: 15,
                          fontSize: 12,
                          fill: '#64748b'
                        }}
                      />
                      <YAxis 
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `$${(value/1000)}k`}
                        label={{ 
                          value: 'Balance', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -10,
                          fontSize: 12,
                          fill: '#64748b'
                        }}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                        labelFormatter={(label) => `Month ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          padding: '8px 12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="remainingBalance" 
                        stroke="#3b82f6" 
                        strokeWidth={2.5} 
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Monthly Budget Breakdown */}
              <Card className="p-6 shadow-sm">
                <h3 className="font-medium mb-6">Monthly Budget Breakdown</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="h-[300px] w-full max-w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateBudgetData()}
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {generateBudgetData().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => formatCurrency(Number(value))}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '8px 12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-auto space-y-4">
                    {generateBudgetData().map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-lg"
                      >
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="border-t pt-8">
            <h3 className="font-medium flex items-center gap-2 mb-6">
              <AlertCircle className="h-5 w-5 text-primary" />
              Recommendations
            </h3>
            <div className="grid gap-4">
              {result.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className="p-4 bg-gray-50/50 rounded-lg border border-gray-100 flex gap-3"
                >
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t p-6">
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Analyze Another Loan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DebtAnalysisResult;
