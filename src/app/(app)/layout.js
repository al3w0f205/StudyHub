import AppLayout from "@/components/layout/AppLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UnifiedAppLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return <AppLayout>{children}</AppLayout>;
}
