import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

interface User {
  id: string;
  clerkUserId: string;
  name: string;
  imageUrl: string;
  email: string;
}

export const checkUser = async (): Promise<User | null> => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
};