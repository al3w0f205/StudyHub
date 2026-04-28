import Google from "next-auth/providers/google";

/**
 * Auth.js config — Edge-compatible subset.
 * This file is imported by the middleware (runs on Edge runtime).
 * It must NOT import Prisma, bcrypt, or any Node.js-only modules.
 */
const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const protectedRoutes = ["/dashboard", "/quiz", "/payment", "/suggest"];
      const adminRoutes = ["/admin"];
      const authRoutes = ["/auth/login"];

      const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
      const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

      // Redirect logged-in users away from auth pages
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(
          new URL(auth.user.role === "ADMIN" ? "/admin" : "/dashboard", nextUrl)
        );
      }

      // Require authentication for protected/admin routes
      if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
        return false; // Redirect to signIn page
      }

      // Check suspension
      if (isLoggedIn && auth.user.isSuspended && pathname !== "/suspended") {
        return Response.redirect(new URL("/suspended", nextUrl));
      }

      // Admin role check
      if (isAdminRoute && auth.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      // Subscription check for quiz routes
      if (pathname.startsWith("/quiz") && auth?.user?.role !== "ADMIN") {
        const expiry = auth?.user?.subscriptionExpiry;
        const isActive = expiry && new Date(expiry) > new Date();
        if (!isActive) {
          return Response.redirect(new URL("/payment?reason=expired", nextUrl));
        }
      }

      return true;
    },
  },
};

export default authConfig;
