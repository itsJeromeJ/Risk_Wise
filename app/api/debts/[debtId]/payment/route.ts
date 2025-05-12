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
    const { amount } = body;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const debt = await db.debt.findUnique({
      where: { id: params.debtId },
    });

    if (!debt) return new NextResponse("Debt not found", { status: 404 });

    // Create payment record
    await db.debtPayment.create({
      data: {
        amount,
        date: new Date(),
        debtId: params.debtId,
      },
    });

    // Update remaining amount
    const newRemainingAmount = Number(debt.remainingAmount) - amount;
    await db.debt.update({
      where: { id: params.debtId },
      data: {
        remainingAmount: Math.max(0, newRemainingAmount),
      },
    });

    revalidatePath("/debt");
    return new NextResponse("Payment processed successfully", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}