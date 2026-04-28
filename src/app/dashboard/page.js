import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { isSubscriptionActive, daysRemaining, formatDate } from "@/lib/utils";
import ClientStats from "./ClientStats";

export const metadata = { title: "Mi Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { paymentRequests: true, questionSuggestions: true } } },
  });

  const subActive = isSubscriptionActive(user.subscriptionExpiry);
  const days = daysRemaining(user.subscriptionExpiry);
  const stats = await Promise.all([
    prisma.career.count(),
    prisma.question.count(),
  ]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, career: { select: { name: true } } }
  });

  const quizProgress = await prisma.quizProgress.findMany({
    where: { userId: session.user.id },
    select: { categoryId: true, score: true },
  });

  const progressMap = {};
  for (const p of quizProgress) {
    progressMap[p.categoryId] = p.score;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Hola, {user.name?.split(" ")[0] || "Estudiante"} 👋
          </h1>
          <p className="page-subtitle">Tu centro de estudio personalizado</p>
        </div>
      </div>

      {/* Subscription Status */}
      <div
        className="solid-card animate-fade-in"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          borderColor: subActive ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)",
          background: subActive ? "rgba(16,185,129,0.03)" : "rgba(244,63,94,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span className={`badge ${subActive ? "badge-success" : "badge-danger"}`}>
                {subActive ? "Suscripción Activa" : "Suscripción Inactiva"}
              </span>
            </div>
            {subActive ? (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Te quedan <strong style={{ color: "var(--accent-400)" }}>{days} días</strong> — Expira el {formatDate(user.subscriptionExpiry)}
              </p>
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Envía tu comprobante de pago para activar tu acceso a los cuestionarios.
              </p>
            )}
          </div>
          {!subActive && (
            <Link href="/payment" className="btn btn-primary btn-sm">
              Enviar Comprobante
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="stat-card animate-fade-in animate-fade-in-delay-1">
          <div className="stat-value">{stats[0]}</div>
          <div className="stat-label">Carreras Disponibles</div>
        </div>
        <div className="stat-card animate-fade-in animate-fade-in-delay-2">
          <div className="stat-value">{stats[1].toLocaleString()}</div>
          <div className="stat-label">Preguntas Totales</div>
        </div>
        <div className="stat-card animate-fade-in animate-fade-in-delay-3">
          <div className="stat-value">{user._count.questionSuggestions}</div>
          <div className="stat-label">Preguntas Sugeridas</div>
        </div>
      </div>

      <ClientStats categories={categories} progress={progressMap} />

      {/* Quick Actions */}
      <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Accesos Rápidos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
        <Link href="/quiz" className="solid-card" style={{ padding: "1.5rem", textDecoration: "none" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📝</div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>Iniciar Cuestionario</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Practica con preguntas de tu carrera</p>
        </Link>
        <Link href="/payment" className="solid-card" style={{ padding: "1.5rem", textDecoration: "none" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💳</div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>Gestionar Suscripción</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Envía tu comprobante de pago</p>
        </Link>
        <Link href="/suggest" className="solid-card" style={{ padding: "1.5rem", textDecoration: "none" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💡</div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>Sugerir Pregunta</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Propón preguntas para la comunidad</p>
        </Link>
      </div>
    </div>
  );
}
