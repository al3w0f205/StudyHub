// =============================================================================
// StudyHub — Proxy / Middleware (Next.js 16)
// =============================================================================
// Este archivo actúa como el middleware de la aplicación. En Next.js 16,
// el archivo se llama "proxy.js" (la convención "middleware.js" está deprecated).
//
// RESPONSABILIDADES:
// 1. Inyectar headers de seguridad en TODAS las respuestas HTTP.
// 2. Ejecutar guards de autenticación (redirigir a login, bloquear suspendidos, etc.)
//
// HEADERS DE SEGURIDAD:
// - X-Frame-Options: DENY → Previene ataques de clickjacking (no permite iframes).
// - X-Content-Type-Options: nosniff → Previene que el navegador "adivine" el tipo MIME.
// - Referrer-Policy: strict-origin-when-cross-origin → Limita info enviada en el Referer.
// - X-XSS-Protection: 1; mode=block → Capa extra contra XSS en navegadores legacy.
// - Content-Security-Policy → Controla qué recursos puede cargar la página.
// - Permissions-Policy → Deshabilita APIs sensibles del navegador (cámara, mic, etc.).
// =============================================================================

import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

// Crear instancia de auth usando la configuración edge-compatible
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // ─── PASO 1: Headers de seguridad ─────────────────────────────────────────
  const response = NextResponse.next();

  // Prevenir clickjacking: no permitir que la página se muestre en iframes
  response.headers.set("X-Frame-Options", "DENY");

  // Prevenir MIME-type sniffing: forzar que el navegador respete Content-Type
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Controlar cuánta información del origen se envía en el header Referer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Protección XSS para navegadores legacy (Chrome, IE)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Content Security Policy — Define qué recursos puede cargar la página
  // NOTA: 'unsafe-inline' y 'unsafe-eval' son necesarios para Next.js y styled-jsx
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

  // Deshabilitar APIs del navegador que no usamos (privacidad del usuario)
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // ─── PASO 2: Guards de autenticación ──────────────────────────────────────

  // Las rutas de API de NextAuth (/api/auth/*) se dejan pasar siempre
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/auth/login", "/auth/register"].includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  if (isApiAuthRoute) return response;

  // Si el usuario ya está logueado y visita /auth/*, redirigir al dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return response;
  }

  // Si no está logueado y la ruta no es pública, redirigir al login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return response;
});

// Matcher: Excluir archivos estáticos, imágenes, favicon, y el manifest del proxy
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
