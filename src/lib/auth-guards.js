// =============================================================================
// StudyHub — Guards de Autenticación para Server Components
// =============================================================================
// Funciones helper para proteger páginas server-side (Server Components).
// Se usan al inicio de las funciones page() en las rutas de admin.
//
// DIFERENCIA CON proxy.js:
//   - proxy.js protege a nivel de middleware (antes de que la página cargue).
//   - Estos guards son una segunda capa de seguridad dentro del Server Component.
//   - Si alguien logra bypasear el middleware, estos guards redireccionan.
// =============================================================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Verifica que el usuario actual sea ADMIN.
 * Si no está logueado, redirige a /auth/login.
 * Si está logueado pero no es ADMIN, redirige a /dashboard.
 *
 * @returns {Promise<Object>} La sesión del usuario admin autenticado
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
