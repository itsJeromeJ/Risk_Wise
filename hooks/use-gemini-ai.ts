'use client'

import { useState, useEffect } from 'react';

interface GeminiResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface Context {
  userProfile?: any;
  marketData?: any;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface InvestorState {
  age: number;
  income: number;
  net_worth: number;
  profession: string;
  horizon: string;
  anticipated_retirement_age: number;
  risk: string;
  goal: string;
  scope: 'basic' | 'comprehensive';
  marital_status: string;
  children: number;
  currentMarketConditions?: any;
  userFinancialData?: any;
  profile: string;
  research_plan: string;
  market_data: string;
  macro_analysis: string;
  portfolio: string;
  proposal: string;
}

export function useGeminiAI() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize Gemini API
  useEffect(() => {
    const initializeGemini = async () => {
      try {
        // In a real implementation, this would initialize the Gemini API client
        // For example: await GeminiAPI.initialize(process.env.GEMINI_API_KEY);
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        console.error("Failed to initialize Gemini AI:", err);
      }
    };

    initializeGemini();
  }, []);

  // Generate a response using Gemini AI
  const generateResponse = async (prompt: string, context?: Context): Promise<string> => {
    if (!isInitialized) {
      throw new Error("Gemini AI is not initialized");
    }

    try {
      // In a real implementation, this would call the Gemini API
      // For now, we'll simulate a response based on the prompt
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a contextual response based on the prompt and user data
      let response = "";
      
      const promptLower = prompt.toLowerCase();
      
      if (context?.userProfile) {
        // Personalize response with user data
        const name = context.userProfile.name || "there";
        
        if (promptLower.includes("investment") || promptLower.includes("invest")) {
          response = `Based on your financial profile, ${name}, I can see you have an income of $${context.userProfile.annualIncome?.toLocaleString() || "N/A"} and a risk tolerance of "${context.userProfile.riskTolerance || "moderate"}".
          
For someone with your profile, I would recommend considering:
• A diversified portfolio with approximately 60% stocks and 40% bonds
• Maximizing your tax-advantaged retirement accounts
• Setting aside 3-6 months of expenses in an emergency fund
• Considering low-cost index funds for the equity portion of your portfolio

Would you like me to provide more specific investment recommendations based on your goals?`;
        } else if (promptLower.includes("budget") || promptLower.includes("spending")) {
          response = `Looking at your financial data, ${name}, I notice your monthly expenses are around $${(context.userProfile.annualIncome / 12 * 0.7).toFixed(2)}.
          
Here's a quick budget analysis:
• Your housing costs appear to be about 30% of your income
• Your debt-to-income ratio is approximately ${context.userProfile.debtToIncomeRatio || "25%"}
• You're currently saving about ${context.userProfile.savingsRate || "15%"} of your income

To improve your financial health, consider:
1. Increasing your emergency fund contributions
2. Reviewing subscription services for potential savings
3. Exploring refinancing options for any high-interest debt

Would you like me to suggest a detailed budget plan?`;
        } else if (promptLower.includes("retirement") || promptLower.includes("retire")) {
          const retirementAge = context.userProfile.targetRetirementAge || 65;
          const currentAge = context.userProfile.age || 35;
          const yearsToRetirement = retirementAge - currentAge;
          
          response = `Based on your profile, ${name}, you're planning to retire in approximately ${yearsToRetirement} years at age ${retirementAge}.
          
With your current savings rate and investment strategy:
• You're on track to accumulate about $${(context.userProfile.annualIncome * 10).toLocaleString()} by retirement
• This would provide an estimated monthly income of $${(context.userProfile.annualIncome * 10 * 0.04 / 12).toFixed(2)} in retirement
• Your retirement income replacement ratio is projected to be ${context.userProfile.incomeReplacementRatio || "70%"}

To enhance your retirement readiness:
1. Consider increasing your retirement contributions by 2-3%
2. Review your investment allocation to ensure it aligns with your time horizon
3. Explore catch-up contributions if you're over 50

Would you like a more detailed retirement planning analysis?`;
        } else {
          // Generic response
          response = `Thanks for your question about "${prompt}". Based on your financial profile, I can provide personalized guidance.
          
Your current financial snapshot:
• Income: $${context.userProfile.annualIncome?.toLocaleString() || "N/A"}
• Net Worth: $${context.userProfile.netWorth?.toLocaleString() || "N/A"}
• Risk Tolerance: ${context.userProfile.riskTolerance || "Moderate"}
• Financial Goals: ${context.userProfile.financialGoals?.join(", ") || "Not specified"}

How can I help you further with your financial planning today?`;
        }
      } else {
        // Generic response without user data
        response = `Thank you for your question about "${prompt}".
        
Without specific details about your financial situation, I can offer general guidance:
• Create a budget that aligns with your financial goals
• Build an emergency fund covering 3-6 months of expenses
• Pay down high-interest debt before focusing on investments
• Consider tax-advantaged retirement accounts like 401(k)s and IRAs
• Diversify investments based on your risk tolerance and time horizon

Would you like to provide more details about your financial situation for personalized advice?`;
      }
      
      return response;
    } catch (err) {
      console.error("Error generating response:", err);
      throw err;
    }
  };

  // Analyze investor profile using LangGraph
  const analyzeInvestorProfile = async (profile: InvestorState): Promise<InvestorState> => {
    if (!isInitialized) {
      throw new Error("Gemini AI is not initialized");
    }

    try {
      // In a real implementation, this would call the LangGraph API with Gemini
      // For now, we'll simulate the analysis process
      
      // Simulate API call delay for each step of the LangGraph process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate personalized analysis based on the investor profile
      const analysisResult: InvestorState = {
        ...profile,
        profile: `Based on your profile as a ${profile.age}-year-old ${profile.profession} with a ${profile.risk} risk tolerance and ${profile.horizon} retirement goals, you're ${profile.horizon === 'long-term' ? 'in a strong position' : 'taking steps'} to build wealth for retirement at age ${profile.anticipated_retirement_age}. 
        
With an income of $${profile.income.toLocaleString()} and net worth of $${profile.net_worth.toLocaleString()}, you have ${profile.net_worth > profile.income * 3 ? 'a solid' : 'a developing'} financial foundation. As a ${profile.marital_status} individual with ${profile.children} ${profile.children === 1 ? 'child' : 'children'}, balancing ${profile.children > 0 ? 'family needs' : 'personal goals'} with future retirement goals will be key to your strategy.`,
        
        research_plan: `For your investment strategy, focus research on:
1. ${profile.goal === 'retirement' ? 'Tax-advantaged retirement accounts (401(k), IRA options)' : profile.goal === 'education' ? 'Education funding vehicles (529 plans, ESAs)' : 'Investment vehicles aligned with your ' + profile.goal + ' goal'}
2. ${profile.children > 0 ? 'Education funding vehicles for your ' + (profile.children === 1 ? 'child' : 'children') : 'Additional retirement savings options'}
3. ${profile.risk === 'conservative' ? 'Low-risk stable investments' : profile.risk === 'moderate' ? 'Moderate-risk growth investments' : 'High-growth investment opportunities'} with ${profile.horizon === 'short-term' ? '1-5' : profile.horizon === 'medium-term' ? '5-10' : '15-20'} year horizons
4. Diversification strategies across domestic and international markets
5. Periodic portfolio rebalancing approaches
6. ${profile.net_worth > 1000000 ? 'Tax optimization strategies for high net worth individuals' : 'Tax-efficient investment approaches'}`,
        
        market_data: `Current market conditions show:
- S&P 500 has averaged ${(Math.random() * 3 + 7).toFixed(1)}% annual returns over the past decade
- Bond yields are at ${(Math.random() * 2 + 3).toFixed(1)}% for 10-year Treasuries
- Inflation is running at ${(Math.random() * 2 + 2).toFixed(1)}% annually
- International markets showing ${Math.random() > 0.5 ? 'increased' : 'moderate'} volatility but potential for ${Math.random() > 0.5 ? 'higher' : 'competitive'} returns
- Real estate investment trusts yielding ${(Math.random() * 2 + 4).toFixed(1)}% on average
- Cryptocurrency markets remain ${Math.random() > 0.5 ? 'highly volatile' : 'unpredictable'} with ${Math.random() > 0.5 ? 'significant' : 'substantial'} risk profiles`,
        
        macro_analysis: `Key macroeconomic factors affecting your investment strategy:
- Federal Reserve policy trending toward ${Math.random() > 0.5 ? 'stable' : 'gradually increasing'} interest rates
- Global economic growth projections ${Math.random() > 0.5 ? 'moderate' : 'cautiously optimistic'} at ${(Math.random() * 2 + 2).toFixed(1)}%
- Demographic shifts increasing healthcare and technology sector opportunities
- Climate transition creating new investment categories and risks
- Geopolitical tensions creating market volatility but also opportunities in ${Math.random() > 0.5 ? 'domestic manufacturing' : 'supply chain diversification'}
- Technological disruption accelerating across multiple sectors`,
        
        portfolio: generatePortfolioRecommendation(profile),
        
        proposal: generateInvestmentProposal(profile)
      };
      
      return analysisResult;
    } catch (err) {
      console.error("Error analyzing investor profile:", err);
      throw err;
    }
  };

  return {
    isInitialized,
    error,
    generateResponse,
    analyzeInvestorProfile
  };
}

// Helper function to generate portfolio recommendation based on risk and horizon
function generatePortfolioRecommendation(profile: InvestorState): string {
  let usEquities = 0;
  let intlEquities = 0;
  let fixedIncome = 0;
  let alternatives = 0;
  let cash = 0;
  
  // Adjust allocations based on risk tolerance
  if (profile.risk === 'conservative') {
    usEquities = 30;
    intlEquities = 10;
    fixedIncome = 40;
    alternatives = 10;
    cash = 10;
  } else if (profile.risk === 'moderate') {
    usEquities = 45;
    intlEquities = 20;
    fixedIncome = 20;
    alternatives = 10;
    cash = 5;
  } else { // aggressive
    usEquities = 60;
    intlEquities = 25;
    fixedIncome = 5;
    alternatives = 8;
    cash = 2;
  }
  
  // Adjust based on time horizon
  if (profile.horizon === 'short-term') {
    // Shift more to fixed income and cash for short-term
    usEquities -= 10;
    intlEquities -= 5;
    fixedIncome += 10;
    cash += 5;
  } else if (profile.horizon === 'long-term') {
    // More equities for long-term
    usEquities += 5;
    intlEquities += 5;
    fixedIncome -= 5;
    cash -= 5;
  }
  
  // Ensure no negative allocations
  usEquities = Math.max(usEquities, 0);
  intlEquities = Math.max(intlEquities, 0);
  fixedIncome = Math.max(fixedIncome, 0);
  alternatives = Math.max(alternatives, 0);
  cash = Math.max(cash, 0);
  
  // Normalize to 100%
  const total = usEquities + intlEquities + fixedIncome + alternatives + cash;
  usEquities = Math.round(usEquities / total * 100);
  intlEquities = Math.round(intlEquities / total * 100);
  fixedIncome = Math.round(fixedIncome / total * 100);
  alternatives = Math.round(alternatives / total * 100);
  cash = 100 - usEquities - intlEquities - fixedIncome - alternatives;
  
  return `Recommended portfolio allocation:
- ${usEquities}% US Equities (${Math.round(usEquities * 0.7)}% large-cap, ${Math.round(usEquities * 0.2)}% mid-cap, ${Math.round(usEquities * 0.1)}% small-cap)
- ${intlEquities}% International Equities (${Math.round(intlEquities * 0.7)}% developed markets, ${Math.round(intlEquities * 0.3)}% emerging markets)
- ${fixedIncome}% Fixed Income (${Math.round(fixedIncome * 0.5)}% government bonds, ${Math.round(fixedIncome * 0.3)}% corporate bonds, ${Math.round(fixedIncome * 0.2)}% TIPS)
- ${alternatives}% Alternative Investments (${Math.round(alternatives * 0.5)}% REITs, ${Math.round(alternatives * 0.5)}% commodities)
- ${cash}% Cash and Equivalents

This ${profile.risk}-risk portfolio balances ${profile.risk === 'aggressive' ? 'growth potential with some' : profile.risk === 'moderate' ? 'growth potential with' : 'stability with growth potential and'} stability appropriate for your ${profile.horizon === 'short-term' ? 'short' : profile.horizon === 'medium-term' ? 'medium' : 'long'}-term horizon.`;
}

// Helper function to generate investment proposal
function generateInvestmentProposal(profile: InvestorState): string {
  const yearsToRetirement = profile.anticipated_retirement_age - profile.age;
  const retirementTimeframe = yearsToRetirement <= 10 ? 'near-term' : yearsToRetirement <= 20 ? 'mid-term' : 'long-term';
  
  return `INVESTMENT PROPOSAL FOR YOUR ${profile.goal.toUpperCase()} STRATEGY

PROFILE SUMMARY:
You're a ${profile.age}-year-old ${profile.profession} with $${profile.income.toLocaleString()} annual income and $${profile.net_worth.toLocaleString()} net worth. You have a ${profile.risk} risk tolerance and aim to retire at age ${profile.anticipated_retirement_age}, giving you a ${yearsToRetirement}-year investment horizon. As a ${profile.marital_status} person with ${profile.children} ${profile.children === 1 ? 'child' : 'children'}, you need to balance ${profile.children > 0 ? 'family financial needs' : 'personal goals'} with ${profile.goal} planning.

RECOMMENDED STRATEGY:
1. ${profile.income > 100000 ? 'Maximize tax-advantaged accounts first:' : 'Build a strong financial foundation:'}
   - ${profile.income > 100000 ? `Contribute the full $${(22500 + (profile.age >= 50 ? 7500 : 0)).toLocaleString()} to your 401(k)${profile.age >= 50 ? ', including catch-up contributions' : ''}` : 'Establish an emergency fund covering 3-6 months of expenses'}
   - ${profile.income > 100000 ? 'Consider backdoor Roth IRA contributions for tax-free growth' : 'Pay down high-interest debt before aggressive investing'}

2. Implement the recommended portfolio allocation with ${profile.horizon === 'short-term' ? 'monthly' : profile.horizon === 'medium-term' ? 'quarterly' : 'semi-annual'} rebalancing

3. ${profile.children > 0 ? `Establish ${profile.children > 1 ? '' : 'a '}529 college savings plan${profile.children > 1 ? 's' : ''} for your ${profile.children > 1 ? 'children' : 'child'} if not already in place` : 'Consider additional tax-advantaged savings vehicles like HSAs if eligible'}

4. Create a systematic investment plan with automatic contributions to maintain discipline

5. Review and adjust your asset allocation annually, ${retirementTimeframe === 'near-term' ? 'quickly shifting' : retirementTimeframe === 'mid-term' ? 'gradually shifting' : 'eventually shifting'} to more conservative investments as you approach retirement

6. ${profile.age > 45 ? 'Consider long-term care insurance to protect your retirement assets' : 'Regularly reassess your insurance coverage as your net worth grows'}

7. ${profile.anticipated_retirement_age >= 62 ? 'Develop a Social Security claiming strategy to maximize lifetime benefits' : 'Plan for healthcare costs in early retirement before Medicare eligibility'}

This comprehensive approach balances growth potential with appropriate risk management for your ${profile.marital_status.toLowerCase()} ${profile.children > 0 ? 'family' : 'individual'} situation and ${yearsToRetirement}-year ${profile.goal} timeline. I recommend reviewing this plan with a certified financial planner to customize it further to your specific needs.`;
}