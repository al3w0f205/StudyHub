import Link from "next/link";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Cuenta Suspendida",
};

export default function SuspendedPage() {
  return (
    <div
      className="relative min-h-dvh flex items-center justify-center"
      style={{ background: "var(--gradient-hero)", padding: "1rem" }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "var(--radius-full)",
            background: "rgba(245, 158, 11, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.75rem",
          }}
        >
          🔒
        </div>

        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "0.75rem",
          }}
        >
          Cuenta Suspendida
        </h1>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Tu cuenta ha sido suspendida temporalmente por un administrador. Si
          crees que esto es un error, por favor contacta al soporte.
        </p>

        <Link
          href="/"
          className="btn btn-secondary btn-lg"
          style={{ width: "100%" }}
          id="suspended-home-btn"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
