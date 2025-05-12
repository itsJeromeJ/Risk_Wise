import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: { debtId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { amount, date } = body;

    if (!amount || !date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the debt to check ownership and current amount
    const debt = await db.debt.findUnique({
      where: { id: params.debtId },
      include: { user: true },
    });

    if (!debt) {
      return new NextResponse("Debt not found", { status: 404 });
    }

    if (debt.user.clerkUserId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create the payment
    const payment = await db.debtPayment.create({
      data: {
        amount: Number(amount),
        date: new Date(date),
        debtId: params.debtId,
      },
    });

    // Update the remaining amount
    const updatedDebt = await db.debt.update({
      where: { id: params.debtId },
      data: {
        remainingAmount: Number(debt.remainingAmount) - Number(amount),
      },
    });

    revalidatePath("/debt");
    return NextResponse.json({ payment, debt: updatedDebt });
  } catch (error) {
    console.error("Error in POST /api/debts/[debtId]/payments:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}