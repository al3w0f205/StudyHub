import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
};

async function handleGoogleLogin() {
  "use server";
  await signIn("google", { redirectTo: "/dashboard" });
}

async function handleAdminLogin(formData: FormData) {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("admin-login", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error: any) {
    // Auth.js throws NEXT_REDIRECT on success, re-throw it
    if (error?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    redirect("/auth/error?error=CredentialsSignin");
  }
}

interface PageProps {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  const mode = params?.mode || "student";
  // const callbackUrl = params?.callbackUrl || "/dashboard";

  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return (
    <div
      className="relative min-h-dvh flex items-center justify-center"
      style={{
        background: "var(--gradient-hero)",
        padding: "1rem",
      }}
    >
      {/* Decorative orbs */}
      <div
        className="glow-orb"
        style={{
          width: "500px",
          height: "500px",
          top: "-150px",
          right: "-100px",
          background: "var(--primary-600)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: "300px",
          height: "300px",
          bottom: "-50px",
          left: "-50px",
          background: "var(--accent-500)",
          opacity: "0.1",
        }}
      />

      <div
        className="glass-card animate-fade-in"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                fontWeight: "800",
                color: "white",
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: "1.375rem",
                fontWeight: "800",
                letterSpacing: "-0.03em",
              }}
            >
              Study<span style={{ color: "var(--primary-400)" }}>Hub</span>
            </span>
          </Link>
          <h1
            style={{ fontSize: "1.25rem", fontWeight: "700", textAlign: "center" }}
          >
            {mode === "admin" ? "Panel Administrativo" : "Bienvenido de vuelta"}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-tertiary)",
              textAlign: "center",
              marginTop: "0.25rem",
            }}
          >
            {mode === "admin"
              ? "Ingresa con tus credenciales de administrador"
              : "Inicia sesión para acceder a tus cuestionarios"}
          </p>
        </div>

        {mode === "admin" ? (
          /* ── Admin Login Form ── */
          <form action={handleAdminLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="admin-email" className="label">
                Correo Electrónico
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="admin@studyhub.com"
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="admin-password" className="label">
                Contraseña
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              id="admin-login-submit"
            >
              Ingresar al Panel
            </button>
          </form>
        ) : (
          /* ── Student Login (Google OAuth) ── */
          <form action={handleGoogleLogin}>
            <button
              type="submit"
              className="btn btn-lg"
              id="google-login-btn"
              style={{
                width: "100%",
                background: "white",
                color: "#1f2937",
                fontWeight: "600",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>
          </form>
        )}

        {/* Mode Toggle */}
        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-default)",
          }}
        >
          {mode === "admin" ? (
            <Link
              href="/auth/login"
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              ← Volver al inicio de sesión de estudiantes
            </Link>
          ) : (
            <Link
              href="/auth/login?mode=admin"
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-tertiary)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Acceso Administrador →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
