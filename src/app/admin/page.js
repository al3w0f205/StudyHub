import prisma from "@/lib/prisma";
import Link from "next/link";
import SeedButton from "./SeedButton";

export const metadata = {
  title: "Dashboard Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [userCount, questionCount, categoryCount, careerCount, pendingPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.category.count(),
      prisma.career.count(),
      prisma.paymentRequest.count({ where: { status: "PENDING" } }),
    ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscriptionExpiry: true,
      createdAt: true,
    },
  });

  const stats = [
    { label: "Usuarios", value: userCount, icon: "👥", color: "var(--primary-400)" },
    { label: "Preguntas", value: questionCount, icon: "❓", color: "var(--accent-400)" },
    { label: "Categorías", value: categoryCount, icon: "📁", color: "var(--warning-400)" },
    { label: "Carreras", value: careerCount, icon: "🎓", color: "var(--danger-400)" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de la plataforma</p>
        </div>
        <SeedButton />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div className="stat-value">{stat.value.toLocaleString()}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments > 0 && (
        <Link href="/admin/payments">
          <div
            className="solid-card"
            style={{
              padding: "1rem 1.5rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              borderColor: "rgba(245, 158, 11, 0.3)",
              background: "rgba(245, 158, 11, 0.05)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                {pendingPayments} pago{pendingPayments > 1 ? "s" : ""} pendiente{pendingPayments > 1 ? "s" : ""} de revisión
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                Haz clic para revisar los comprobantes
              </div>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-tertiary)" }}>→</span>
          </div>
        </Link>
      )}

      {/* Recent Users */}
      <div className="solid-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "700" }}>Usuarios Recientes</h2>
          <Link href="/admin/users" className="btn btn-ghost btn-sm" id="view-all-users-btn">
            Ver todos →
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p>Aún no hay usuarios registrados</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Suscripción</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => {
                  const isSubActive =
                    user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                          {user.name || "Sin nombre"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.role === "ADMIN" ? "badge-primary" : "badge-success"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === "ADMIN" ? (
                          <span className="badge badge-primary">N/A</span>
                        ) : isSubActive ? (
                          <span className="badge badge-success">Activa</span>
                        ) : (
                          <span className="badge badge-danger">Inactiva</span>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8125rem" }}>
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
