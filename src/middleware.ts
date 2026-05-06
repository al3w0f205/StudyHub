import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// @ts-ignore - NextAuth types for middleware are tricky with the custom auth wrapper
export default auth((req: NextRequest & { auth: any }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' blob: data: https://*.googleusercontent.com https://utfs.io https://lh3.googleusercontent.com",
      "connect-src 'self' https://utfs.io https://api.uploadthing.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // 2. Auth Guards
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/auth/login", "/auth/register"].includes(
    nextUrl.pathname
  );
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  if (isApiAuthRoute) return response;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return response;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
