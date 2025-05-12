// src/actions/debt.ts
"use server";

import { Decimal } from "@prisma/client/runtime/library";
import prisma, { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// import { z } from "zod"; // Uncomment if you want Zod validation

// Optional: define Zod schema
/*
const debtInputSchema = z.object({
  name: z.string().min(1),
  totalAmount: z.number().positive(),
  remainingAmount: z.number().min(0),
  interestRate: z.number().min(0),
  minimumPayment: z.number().min(0),
  dueDate: z.date(),
  type: z.enum(["CREDIT_CARD", "LOAN", "OTHER"]),
  userId: z.string().uuid(),
});
*/

type DebtInput = {
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: Date;
  type:   "MORTGAGE"|
  "CREDIT_CARD"|
  "STUDENT_LOAN"|
  "CAR_LOAN"|
  "PERSONAL_LOAN"|
  "OTHER";
  userId: string;
};

export async function createDebt(input: DebtInput) {
  try {
    // Optional validation
    // debtInputSchema.parse(input);

    const debt = await prisma.debt.create({
      data: {
        name: input.name,
        totalAmount: new Decimal(input.totalAmount),
        remainingAmount: new Decimal(input.remainingAmount),
        interestRate: new Decimal(input.interestRate),
        minimumPayment: new Decimal(input.minimumPayment),
        dueDate: input.dueDate,
        type: input.type as "MORTGAGE"|"CREDIT_CARD"|"STUDENT_LOAN"|"PERSONAL_LOAN"|"OTHER", // Type assertion to match DebtType
        userId: input.userId,
      },
    });

    revalidatePath("/debt");
    return { success: true, data: debt };

  } catch (error) {
    console.error("Error creating debt:", error);
    throw new Error("Failed to create debt");
  }
}

