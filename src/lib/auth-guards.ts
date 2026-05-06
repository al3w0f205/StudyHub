import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Verifica que el usuario actual sea ADMIN.
 * Si no está logueado, redirige a /auth/login.
 * Si está logueado pero no es ADMIN, redirige a /dashboard.
 *
 * @returns {Promise<any>} La sesión del usuario admin autenticado
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
}
