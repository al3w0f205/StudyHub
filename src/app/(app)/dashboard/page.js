import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSubscriptionActive, daysRemaining, formatDate } from "@/lib/utils";
import ClientStats from "./ClientStats";

export const metadata = { title: "Mi Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard");

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { paymentRequests: true, questionSuggestions: true } } },
    });

    if (!user) {
      redirect("/auth/login?error=user_not_found");
    }

  const subActive = isSubscriptionActive(user.subscriptionExpiry);
  const days = daysRemaining(user.subscriptionExpiry);
  const allowedCareers = user.allowedCareers?.split(",").filter(Boolean) ?? [];
  const isAdmin = user.role === "ADMIN";
  const careerWhere = isAdmin
    ? {}
    : allowedCareers.length > 0
      ? { slug: { in: allowedCareers } }
      : { id: "__no_access__" };
  const categoryWhere = isAdmin
    ? {}
    : allowedCareers.length > 0
      ? { career: { slug: { in: allowedCareers } } }
      : { id: "__no_access__" };
  const stats = await Promise.all([
    prisma.career.count({ where: careerWhere }),
    prisma.question.count({ where: { category: categoryWhere } }),
  ]);

  const categories = await prisma.category.findMany({
    where: categoryWhere,
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
      <div
        className="solid-card animate-fade-in"
        style={{
          padding: "1.5rem",
          marginBottom: "1.5rem",
          background: "linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(34,211,238,0.08) 100%)",
          border: "1px solid rgba(99,102,241,0.28)",
        }}
      >
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">
              Hola, {user.name?.split(" ")[0] || "Estudiante"} 👋
            </h1>
            <p className="page-subtitle">Tu centro de estudio personalizado</p>
          </div>
          <Link href="/quiz" className="btn btn-primary btn-sm">
            Empezar a estudiar
          </Link>
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
        <Link href="/leaderboard" className="solid-card" style={{ padding: "1.5rem", textDecoration: "none" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏆</div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>Ver Leaderboard</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Clasificación global de estudiantes</p>
        </Link>
        <Link href="/suggest" className="solid-card" style={{ padding: "1.5rem", textDecoration: "none" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>💡</div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>Sugerir Pregunta</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Propón preguntas para la comunidad</p>
        </Link>
        <Link href="/updates" className="solid-card" style={{ 
          padding: "1.5rem", 
          textDecoration: "none", 
          border: "1px solid var(--accent-400)",
          background: "linear-gradient(135deg, rgba(34,211,238,0.05) 0%, transparent 100%)"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🚀</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.25rem" }}>¿Qué hay de nuevo?</h3>
            <span className="badge badge-primary" style={{ fontSize: "0.625rem" }}>NUEVO</span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Mira las últimas actualizaciones</p>
        </Link>
      </div>
    </div>
    );
  } catch (error) {
    console.error("DashboardPage Error:", error);
    return (
      <div style={{ maxWidth: 700, margin: "2rem auto", padding: "2rem", textAlign: "center" }} className="solid-card">
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Error de Conexión</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con el servidor para cargar tus estadísticas.
        </p>
        <a href="/dashboard" className="btn btn-primary">Recargar</a>
      </div>
    );
  }
}
