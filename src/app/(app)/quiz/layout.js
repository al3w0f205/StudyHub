import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function QuizLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  // Admins always have access
  if (session.user.role === "ADMIN") {
    return <>{children}</>;
  }

  return <>{children}</>;
}
