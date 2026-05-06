import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function UnifiedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return <AppLayout>{children}</AppLayout>;
}
