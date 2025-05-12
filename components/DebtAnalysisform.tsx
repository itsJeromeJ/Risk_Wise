import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Calculator, CreditCard, DollarSign, AlertCircle, TrendingDown, AlertTriangle, RefreshCw } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  monthlyIncome: z.coerce.number().positive("Income must be greater than 0"),
  monthlyExpenses: z.coerce.number().nonnegative("Expenses cannot be negative"),
  existingEMIs: z.coerce.number().nonnegative("Existing EMIs cannot be negative"),
  loanAmount: z.coerce.number().positive("Loan amount must be greater than 0"),
  loanTenureMonths: z.coerce.number().int().positive("Loan tenure must be greater than 0"),
  interestRate: z.coerce.number().positive("Interest rate must be greater than 0"),
  creditScore: z.coerce.number().min(300, "Credit score must be at least 300").max(900, "Credit score cannot exceed 900"),
});

type DebtFormData = z.infer<typeof formSchema>;

interface DebtAnalysisFormProps {
  onSubmit: (data: DebtFormData) => void;
  initialDebts?: any[];
  totals?: { income: number; expense: number };
}

const DebtAnalysisForm = ({ onSubmit, initialDebts, totals }: DebtAnalysisFormProps) => {
  const [loanTenure, setLoanTenure] = useState(36);
  const [creditScore, setCreditScore] = useState(750);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DebtFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      existingEMIs: 0,
      loanAmount: 0,
      loanTenureMonths: 36,
      interestRate: 9.5,
      creditScore: 750,
    },
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      try {
        const statsResponse = await fetch('/api/stats/monthly');
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          form.reset({
            monthlyIncome: stats.totalIncome || 0,
            monthlyExpenses: stats.totalExpenses || 0,
            existingEMIs: stats.existingEMIs || 0,
            loanAmount: 0,
            loanTenureMonths: 36,
            interestRate: 9.5,
            creditScore: 750,
          });
        } else {
          console.warn('Could not fetch stats, using default values');
        }
      } catch (error) {
        console.warn('Error fetching stats:', error);
      }

    } catch (error) {
      console.error('Error in form initialization:', error);
      setError('There was an error loading the form. You can still proceed with manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [form]);

  // Calculate real-time DTI ratio
  const calculateCurrentDTI = (values: Partial<DebtFormData>) => {
    if (!values.monthlyIncome) return 0;
    const totalDebt = (values.existingEMIs || 0);
    return (totalDebt / values.monthlyIncome) * 100;
  };

  const currentDTI = calculateCurrentDTI(form.watch());

  const handleSubmit = (data: DebtFormData) => {
    try {
      onSubmit(data);
      toast.success("Analysis complete", {
        description: "Your debt risk analysis is ready to view",
      });
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again with valid inputs",
      });
    }
  };

  // Add a manual refresh button
  const handleRefresh = () => {
    void fetchInitialData();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-7xl mx-auto bg-white shadow-sm">
      <CardHeader className="border-b bg-gray-50/50 pb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Debt Affordability Analysis
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Enter your financial details to assess if a new loan or EMI is right for you
            </CardDescription>
          </div>
          {error && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
        
        
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Main financial inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Monthly Income */}
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Monthly Income</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          className="pl-9 h-11 text-base bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Your total monthly income after tax
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monthly Expenses - follow same pattern as Monthly Income */}
              <FormField
                control={form.control}
                name="monthlyExpenses"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Monthly Expenses</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          className="pl-9 h-11 text-base bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Your regular monthly expenses excluding EMIs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing EMIs - follow same pattern */}
              <FormField
                control={form.control}
                name="existingEMIs"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Existing EMIs/Loan Payments</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          className="pl-9 h-11 text-base bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Total of all existing loan payments per month
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loan Details Section */}
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">New Loan Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          className="pl-9 h-11 text-base bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      The amount you wish to borrow
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loan Tenure with improved slider */}
              <FormField
                control={form.control}
                name="loanTenureMonths"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Loan Tenure</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          defaultValue={[loanTenure]}
                          min={12}
                          max={84}
                          step={12}
                          onValueChange={(values) => {
                            const value = values[0];
                            setLoanTenure(value);
                            field.onChange(value);
                          }}
                          className="py-4"
                        />
                        <div className="text-sm font-medium text-primary">{loanTenure} months</div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Duration of the loan in months
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Rate */}
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        placeholder="0.0" 
                        {...field} 
                        className="h-11 text-base bg-white border-gray-200 hover:border-gray-300 focus-visible:ring-1"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Annual interest rate for the loan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Credit Score Section */}
            <div className="border-t pt-8 mt-8">
              <FormField
                control={form.control}
                name="creditScore"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base">Credit Score</FormLabel>
                      <span className="text-sm font-medium text-primary">{creditScore}</span>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-4 py-2">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <Slider
                          defaultValue={[creditScore]}
                          min={300}
                          max={900}
                          step={10}
                          onValueChange={(values) => {
                            const value = values[0];
                            setCreditScore(value);
                            field.onChange(value);
                          }}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Your current credit score (300-900)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium mt-8"
              variant="default"
            >
              Analyze Debt Risk
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DebtAnalysisForm;
