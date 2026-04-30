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

  // Fetch real-time subscription status from DB to avoid stale JWT tokens
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionExpiry: true },
  });

  const isActive = user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

  if (!isActive) {
    redirect("/payment?reason=expired");
  }

  return <>{children}</>;
}
