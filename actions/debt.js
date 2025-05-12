"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
export async function getDebtAccounts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const debtAccounts = await db.debt.findMany({
        where: { userId }
    });

    return debtAccounts;
  } catch (error) {
    console.error("Error fetching debt accounts:", error);
    throw new Error("Failed to fetch debt accounts");
  }
}

export async function createDebt(debtData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const debt = await db.debt.create({
      data: { ...debtData, userId },
    });

    revalidatePath("/debt");

    return debt;
  } catch (error) {
    console.error("Error creating debt:", error);
    throw new Error("Failed to create debt");
  }
}


