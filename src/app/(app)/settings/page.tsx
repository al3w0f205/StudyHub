import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, isSubscriptionActive } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Configuración" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/auth/login");

  const payments = await prisma.paymentRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const subActive = isSubscriptionActive(user.subscriptionExpiry);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración ⚙️</h1>
          <p className="page-subtitle">
            Gestiona tu cuenta, suscripciones y preferencias
          </p>
        </div>
        <Link href="/quiz" className="btn btn-secondary">
          ← Volver
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* -- PERFIL -- */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            👤 Perfil
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Nombre
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                {user.name || "Sin nombre"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Email
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                {user.email}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Estado de Suscripción
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "0.25rem",
                }}
              >
                <span
                  className={`badge ${subActive ? "badge-success" : "badge-danger"}`}
                >
                  {subActive ? "Activa" : "Inactiva"}
                </span>
                {subActive && (
                  <span
                    style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
                  >
                    hasta {formatDate(user.subscriptionExpiry!)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* -- APARIENCIA & PREFERENCIAS -- */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            🎨 Apariencia
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div>
              <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                Tema Visual
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                Alterna entre modo Claro y Oscuro
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              💡 Sugerencias
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginBottom: "1rem",
              }}
            >
              ¿Encontraste un error o quieres añadir preguntas a una carrera?
            </p>
            <Link
              href="/suggest"
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Ir a Sugerencias
            </Link>
          </div>
        </div>
      </div>

      {/* -- FACTURACION -- */}
      <div
        className="solid-card"
        style={{ padding: "1.5rem", marginBottom: "2rem" }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          💳 Historial de Facturación
        </h2>

        {payments.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-default)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧾</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>
              Aún no tienes registros de pagos.
            </p>
            <Link
              href="/payment"
              className="btn btn-primary btn-sm"
              style={{ marginTop: "1rem" }}
            >
              Enviar un pago
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Notas del Admin</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.createdAt)}</td>
                    <td>
                      {p.status === "APPROVED" && (
                        <span className="badge badge-success">Aprobado</span>
                      )}
                      {p.status === "PENDING" && (
                        <span className="badge badge-warning">En revisión</span>
                      )}
                      {p.status === "REJECTED" && (
                        <span className="badge badge-danger">Rechazado</span>
                      )}
                    </td>
                    <td
                      style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}
                    >
                      {p.adminNotes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -- FAQ -- */}
      <div className="solid-card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          ❓ Preguntas Frecuentes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              q: "¿Cuánto tarda en aprobarse mi pago?",
              a: "Los pagos enviados se procesan de forma manual por un administrador y suelen tardar menos de 24 horas laborables en ser verificados.",
            },
            {
              q: "¿Cómo renuevo mi suscripción?",
              a: "Simplemente vuelve a la pestaña de 'Enviar un pago' y envía tu nuevo comprobante. Al ser aprobado, se sumarán 30 días a tu cuenta.",
            },
            {
              q: "¿Puedo solicitar una nueva carrera?",
              a: "Sí. Cuando envíes un comprobante de pago, podrás ver una lista de carreras. Si la tuya no está, contáctanos a través del menú de sugerencias.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                {faq.q}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
