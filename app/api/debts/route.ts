import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        debts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      // Create user if not found
      const newUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email: "", // This will be updated when user logs in
          name: "",
        },
      });
      return NextResponse.json([]);
    }

    return NextResponse.json(user.debts);
  } catch (error) {
    console.error("Error in GET /api/debts:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, totalAmount, remainingAmount, interestRate, minimumPayment, dueDate, type } = body;

    if (!name || !totalAmount || !remainingAmount || !interestRate || !minimumPayment || !dueDate || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      // Create user if not found
      const newUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email: "", // This will be updated when user logs in
          name: "",
        },
      });
    }

    const debt = await db.debt.create({
      data: {
        name,
        totalAmount: Number(totalAmount),
        remainingAmount: Number(remainingAmount),
        interestRate: Number(interestRate),
        minimumPayment: Number(minimumPayment),
        dueDate: new Date(dueDate),
        type,
        userId: user.id,
      },
    });

    revalidatePath("/debt");
    return NextResponse.json(debt);
  } catch (error) {
    console.error("Error in POST /api/debts:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}