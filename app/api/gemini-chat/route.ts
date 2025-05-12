// app/api/gemini-chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserFinancialDataService } from "@/lib/services/user-financial-data";

// Validate the API key from environment
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables.");
}

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Support both 'prompt' (used by ai-chat-simple) and 'message' (used by enhanced-ai-chat)
    const prompt = body.prompt || body.message;
    const userId = body.userId || 'user123'; // Default to demo user if not provided

    // Validate user prompt
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    // Get user financial data
    const financialDataService = UserFinancialDataService.getInstance();
    const userData = financialDataService.getUserFinancialData(userId);
    const transactions = financialDataService.getTransactions(userId, 10);
    const debts = financialDataService.getDebts(userId);
    const budgets = financialDataService.getBudgets(userId);
    const savingsGoals = financialDataService.getSavingsGoals(userId);
    const netWorth = financialDataService.getNetWorth(userId);
    const incomeStreams = financialDataService.getIncomeStreams(userId);
    const spendingByCategory = financialDataService.getSpendingByCategory(userId);
    const debtSummary = financialDataService.getDebtSummary(userId);
    const incomeVsExpenses = financialDataService.getIncomeVsExpenses(userId);
    const budgetHealth = financialDataService.getBudgetHealth(userId);
    const insights = financialDataService.generateFinancialInsights(userId);

    // Prepare system prompt with user financial data
    const systemPrompt = `
You are a helpful financial advisor AI assistant for a personal finance management application.
Your goal is to provide clear, accurate, and personalized financial advice.

When responding to user queries:
1. Be conversational but professional
2. Provide actionable financial advice when appropriate
3. Explain financial concepts in simple terms
4. If asked about specific financial products, explain them objectively
5. Avoid making specific investment recommendations for individual stocks
6. Focus on general financial principles and best practices
7. If you do not know something, be honest about it
8. Format your responses with proper markdown - use **bold** for emphasis, create proper lists with numbers or bullets, and use headings where appropriate
9. When showing financial figures, format currency values properly (e.g., $1,234.56)

USER'S FINANCIAL DATA:
---
Recent Transactions: ${JSON.stringify(transactions)}
Debts: ${JSON.stringify(debts)}
Budgets: ${JSON.stringify(budgets)}
Savings Goals: ${JSON.stringify(savingsGoals)}
Net Worth: ${JSON.stringify(netWorth)}
Income Streams: ${JSON.stringify(incomeStreams)}
Spending By Category: ${JSON.stringify(spendingByCategory)}
Debt Summary: ${JSON.stringify(debtSummary)}
Income vs Expenses: ${JSON.stringify(incomeVsExpenses)}
Budget Health: ${JSON.stringify(budgetHealth)}
Financial Insights: ${JSON.stringify(insights)}
---

USER QUERY: ${prompt}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const temperature = 0.5; // Adjust the temperature for response variability

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Gemini API error:", error?.message || error);

    if (error.message?.includes("API key expired") || error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json({
        response: "The AI service API key has expired or is invalid. Please update the API key.",
      });
    }

    if (error.message?.includes("model")) {
      return NextResponse.json({
        response: "The requested AI model is currently unavailable. Please try again later.",
      });
    }

    return NextResponse.json({
      response: "An unexpected error occurred while processing your request.",
    }, { status: 500 });
  }
}
