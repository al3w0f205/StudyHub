import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { 
  publicRoutes, 
  authRoutes, 
  protectedRoutes, 
  adminRoutes 
} from "@/routes";

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

      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
      const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
      const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(
            new URL(auth?.user?.role === "ADMIN" ? "/admin" : "/dashboard", nextUrl)
          );
        }
        return true;
      }

      if (isAdminRoute && (!isLoggedIn || auth?.user?.role !== "ADMIN")) {
        return Response.redirect(new URL(isLoggedIn ? "/dashboard" : "/auth/login", nextUrl));
      }

      if (isProtectedRoute && !isLoggedIn) {
        return false;
      }

      if (isLoggedIn && auth?.user?.isSuspended && pathname !== "/suspended") {
        return Response.redirect(new URL("/suspended", nextUrl));
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
