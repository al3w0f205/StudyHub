import prisma from "@/lib/prisma";
import Link from "next/link";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Novedades y Actualizaciones — StudyHub",
};

export default async function UpdatesPage() {
  const updates = await prisma.changelog.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div
      style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.25rem" }}
    >
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "1rem" }}>
          ¿Qué hay de <span style={{ color: "var(--accent-400)" }}>nuevo</span>?
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "1.125rem" }}>
          Sigue la evolución de StudyHub y descubre las últimas funciones.
        </p>
        <Link
          href="/dashboard"
          className="btn btn-secondary"
          style={{ marginTop: "2rem", borderRadius: "var(--radius-full)" }}
        >
          ← Volver al Panel
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
          position: "relative",
        }}
      >
        {/* Timeline Line */}
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: 0,
            bottom: 0,
            width: "2px",
            background:
              "linear-gradient(to bottom, var(--accent-400), transparent)",
            opacity: 0.2,
          }}
        />

        {updates.map((update) => (
          <div
            key={update.id}
            className="animate-fade-in"
            style={{
              paddingLeft: "3.5rem",
              position: "relative",
            }}
          >
            {/* Timeline Dot */}
            <div
              style={{
                position: "absolute",
                left: "14px",
                top: "6px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background:
                  update.type === "FEATURE"
                    ? "var(--accent-400)"
                    : update.type === "FIX"
                    ? "var(--danger-400)"
                    : "var(--primary-400)",
                border: "3px solid var(--bg-primary)",
                boxShadow: `0 0 10px ${
                  update.type === "FEATURE" ? "var(--accent-400)" : "transparent"
                }`,
              }}
            />

            <div
              className="solid-card"
              style={{ padding: "2rem", border: "1px solid var(--border-default)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: "800",
                      color:
                        update.type === "FEATURE"
                          ? "var(--accent-400)"
                          : "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {update.type} {update.version && `• ${update.version}`}
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "800" }}>
                    {update.title}
                  </h2>
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-tertiary)",
                    fontWeight: "500",
                  }}
                >
                  {new Date(update.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div
                className="update-content"
                style={{
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  fontSize: "1rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {update.content}
              </div>
            </div>
          </div>
        ))}

        {updates.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>
            No hay actualizaciones registradas aún.
          </div>
        )}
      </div>
    </div>
  );
}
