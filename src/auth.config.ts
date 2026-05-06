import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
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

      const protectedRoutes = [
        "/dashboard",
        "/quiz",
        "/payment",
        "/suggest",
        "/badges",
        "/updates",
      ];
      const adminRoutes = ["/admin"];
      const authRoutes = ["/auth/login"];

      const isProtectedRoute = protectedRoutes.some((r) =>
        pathname.startsWith(r)
      );
      const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
      const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

      if (isAuthRoute && isLoggedIn && auth?.user) {
        return Response.redirect(
          new URL(auth.user.role === "ADMIN" ? "/admin" : "/dashboard", nextUrl)
        );
      }

      if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
        return false;
      }

      if (isLoggedIn && auth?.user?.isSuspended && pathname !== "/suspended") {
        return Response.redirect(new URL("/suspended", nextUrl));
      }

      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (pathname.startsWith("/dashboard") && auth?.user?.role === "ADMIN") {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.subscriptionExpiry = token.subscriptionExpiry as string;
        session.user.isSuspended = token.isSuspended as boolean;
        session.user.allowedCareers = token.allowedCareers as string;
      }
      return session;
    },
  },
};

export default authConfig;
