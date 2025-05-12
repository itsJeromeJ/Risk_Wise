import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get current month's data
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Get transactions for the current month
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate totals from transactions
    const stats = transactions.reduce(
      (acc, transaction) => {
        const amount = transaction.amount.toNumber();
        if (transaction.type === "EXPENSE") {
          acc.totalExpenses += amount;
        } else {
          acc.totalIncome += amount;
        }
        return acc;
      },
      { totalExpenses: 0, totalIncome: 10000 } // Default income of 5000 if no income transactions
    );

    // Get existing EMIs (minimum payments from all active debts)
    const debts = await db.debt.findMany({
      where: {
        userId: user.id,
        remainingAmount: {
          gt: 0,
        },
      },
    });

    const totalEMIs = debts.reduce(
      (sum, debt) => sum + debt.minimumPayment.toNumber(),
      0
    );

    return NextResponse.json({
      ...stats,
      existingEMIs: totalEMIs,
    });
  } catch (error) {
    console.error("Error in GET /api/stats/monthly:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}