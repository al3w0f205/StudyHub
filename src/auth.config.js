// =============================================================================
// StudyHub — Configuración de Auth Edge-Compatible (proxy.js / middleware)
// =============================================================================
// Este archivo contiene la configuración de NextAuth que es compatible con el
// Edge Runtime. Se importa desde proxy.js (middleware de Next.js 16).
//
// RESTRICCIÓN CRÍTICA:
// Este archivo NO puede importar Prisma, bcrypt, ni ningún módulo exclusivo
// de Node.js, ya que el proxy/middleware se ejecuta en el Edge Runtime de Vercel.
//
// FLUJO DE AUTORIZACIÓN:
// 1. Redirigir usuarios autenticados lejos de /auth/*
// 2. Proteger rutas de /dashboard, /quiz, /payment, etc.
// 3. Verificar rol ADMIN para /admin/*
// 4. Bloquear usuarios suspendidos → /suspended
// 5. Verificar suscripción activa para /quiz/*
// =============================================================================

import Google from "next-auth/providers/google";

/**
 * Configuración de Auth.js para Edge Runtime.
 * Solo incluye el proveedor Google OAuth (no Credentials, que requiere bcrypt).
 */
const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  // Páginas personalizadas de autenticación
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  callbacks: {
    // -----------------------------------------------------------------------
    // Authorized Callback — Guard principal de rutas.
    // Determina si un request debe continuar, redirigir, o ser bloqueado.
    //
    // FLUJO DE DECISIONES:
    //   1. /auth/* + logueado → redirigir a /dashboard o /admin según rol
    //   2. Rutas protegidas + no logueado → redirigir a login
    //   3. Logueado + suspendido → redirigir a /suspended
    //   4. /admin/* + no ADMIN → redirigir a /dashboard
    //   5. /dashboard + ADMIN → redirigir a /admin
    //   6. /quiz/* + sin suscripción → redirigir a /payment?reason=expired
    // -----------------------------------------------------------------------
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Definición de grupos de rutas
      const protectedRoutes = ["/dashboard", "/quiz", "/payment", "/suggest", "/offline", "/badges", "/updates"];
      const adminRoutes = ["/admin"];
      const authRoutes = ["/auth/login"];

      const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
      const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

      // 1. Redirigir usuarios autenticados lejos de páginas de login
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(
          new URL(auth.user.role === "ADMIN" ? "/admin" : "/dashboard", nextUrl)
        );
      }

      // 2. Requerir autenticación para rutas protegidas
      if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
        return false; // NextAuth redirige automáticamente a signIn page
      }

      // 3. Bloquear usuarios suspendidos en cualquier ruta excepto /suspended
      if (isLoggedIn && auth.user.isSuspended && pathname !== "/suspended") {
        return Response.redirect(new URL("/suspended", nextUrl));
      }

      // 4. Verificar que solo ADMIN acceda a rutas de administración
      if (isAdminRoute && auth.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // 5. Los admins no necesitan el dashboard de estudiantes
      if (pathname.startsWith("/dashboard") && auth.user?.role === "ADMIN") {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // 6. El acceso a cuestionarios (/quiz) se valida en tiempo real dentro de layout.js
      // para evitar bloqueos por tokens JWT obsoletos tras una aprobación de pago.
      
      return true;
    },

    // -----------------------------------------------------------------------
    // Session Callback — Enriquece el objeto session con datos del JWT.
    // Los datos del token (id, role, suscripción, etc.) se copian al objeto
    // session.user para que estén disponibles en el cliente.
    // -----------------------------------------------------------------------
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscriptionExpiry = token.subscriptionExpiry;
        session.user.isSuspended = token.isSuspended;
        session.user.allowedCareers = token.allowedCareers;
      }
      return session;
    },
  },
};

export default authConfig;
