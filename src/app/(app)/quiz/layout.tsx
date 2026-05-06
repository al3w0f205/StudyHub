import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export default async function QuizLayout({
  children,
}: {
  children: ReactNode;
}) {
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
