import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      monthlyIncome,
      monthlyExpenses,
      existingEMIs,
      loanAmount,
      loanTenureMonths,
      interestRate,
      creditScore,
      emi,
      debtToIncomeRatio,
      affordabilityRatio,
    } = data;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      As a financial advisor, analyze this loan scenario and provide 3-4 personalized recommendations.
      Focus on actionable advice and risk management.

      Financial Profile:
      - Monthly Income: $${monthlyIncome}
      - Monthly Expenses: $${monthlyExpenses}
      - Existing EMIs: $${existingEMIs}
      - Credit Score: ${creditScore}

      Loan Details:
      - Loan Amount: $${loanAmount}
      - Tenure: ${loanTenureMonths} months
      - Interest Rate: ${interestRate}%
      - New EMI: $${emi}

      Key Metrics:
      - Debt-to-Income Ratio: ${debtToIncomeRatio}%
      - Affordability Ratio: ${affordabilityRatio}%

      Provide specific, actionable recommendations considering:
      1. Current debt burden
      2. Risk level
      3. Budget management
      4. Credit score impact
      5. Alternative options if risk is high

      Format the response as a JSON array of strings, each containing one recommendation.
      Keep recommendations concise, specific, and actionable.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up the response and parse JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    const recommendations = JSON.parse(cleanedText);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Fallback recommendations if AI fails
    return NextResponse.json({
      recommendations: [
        "Consider reducing your monthly expenses to improve debt servicing capacity.",
        "Look into debt consolidation options to potentially lower your interest rates.",
        "Build an emergency fund before taking on additional debt.",
        "Work on improving your credit score to qualify for better interest rates.",
      ],
    });
  }
} 