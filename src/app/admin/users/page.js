import Image from "next/image";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = { title: "Gestión de Usuarios" };
export const dynamic = "force-dynamic";

async function toggleSubscription(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  const isActive = formData.get("isActive") === "true";
  
  await prisma.user.update({
    where: { id },
    data: { 
      subscriptionExpiry: isActive ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    },
  });
  redirect("/admin/users");
}

async function updateAllowedCareers(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  const careerSlug = formData.get("careerSlug");
  const action = formData.get("action");
  
  const [user, allCareers] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { allowedCareers: true, subscriptionExpiry: true } }),
    prisma.career.findMany({ select: { slug: true } })
  ]);
  
  if (!user) redirect("/admin/users");

  let allowed = user.allowedCareers ? user.allowedCareers.split(",").filter(c => c.trim()) : [];
  
  const validCareerSlugs = new Set(allCareers.map(c => c.slug));

  if (careerSlug === "general" && action === "add") {
    // Grant access to ALL careers
    allowed = allCareers.map(c => c.slug);
  } else if (action === "add" && validCareerSlugs.has(careerSlug) && !allowed.includes(careerSlug)) {
    allowed.push(careerSlug);
  } else if (action === "remove") {
    if (careerSlug === "general") {
      allowed = []; // Remove all if general is removed
    } else {
      allowed = allowed.filter(c => c !== careerSlug);
    }
  }
  
  const userUpdateData = {
    allowedCareers: allowed.length > 0 ? allowed.join(",") : null 
  };

  // If we added access (either general or specific), and the user has no active sub, 
  // give them 30 days automatically to avoid the "payment required" loop.
  const isSubActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
  if (action === "add" && !isSubActive) {
    userUpdateData.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  await prisma.user.update({
    where: { id },
    data: userUpdateData,
  });
  redirect("/admin/users");
}

export default async function UsersPage() {
  await requireAdmin();
  try {
    const [users, careers] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true, image: true,
          subscriptionExpiry: true, isSuspended: true, createdAt: true, allowedCareers: true,
          _count: { select: { paymentRequests: true } },
        },
      }),
      prisma.career.findMany({ orderBy: { name: "asc" } })
    ]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">{users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="solid-card empty-state"><div className="empty-state-icon">👥</div><p>No hay usuarios</p></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Usuario</th><th>Rol</th><th>Accesos (Carreras)</th><th>Suscripción</th><th>Pagos</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isActive = u.subscriptionExpiry && new Date(u.subscriptionExpiry) > new Date();
                const allowedList = u.allowedCareers ? u.allowedCareers.split(",") : [];
                
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {u.image ? (
                          <Image src={u.image} alt="" width={32} height={32} style={{ borderRadius: "var(--radius-full)" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>
                            {(u.name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{u.name || "Sin nombre"}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${u.role === "ADMIN" ? "badge-primary" : "badge-success"}`}>{u.role}</span></td>
                    <td>
                      {u.role === "ADMIN" ? "Todas (Admin)" : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                          {/* General Access Toggle */}
                          <form action={updateAllowedCareers}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="careerSlug" value="general" />
                            <input type="hidden" name="action" value={allowedList.length === careers.length ? "remove" : "add"} />
                            <button type="submit" style={{ 
                              background: allowedList.length === careers.length ? "rgba(16,185,129,0.15)" : "var(--glass-bg)",
                              border: "1px solid " + (allowedList.length === careers.length ? "rgba(16,185,129,0.3)" : "var(--border-default)"),
                              borderRadius: "var(--radius-sm)",
                              color: allowedList.length === careers.length ? "var(--success-400)" : "var(--text-primary)",
                              fontSize: "0.7rem", fontWeight: "700", cursor: "pointer",
                              padding: "0.25rem 0.5rem", width: "100%", textAlign: "center"
                            }}>
                              {allowedList.length === careers.length ? "✨ ACCESO GENERAL" : "🔓 DAR ACCESO GENERAL"}
                            </button>
                          </form>
                          
                          <div style={{ borderTop: "1px solid var(--border-default)", marginTop: "0.25rem", paddingTop: "0.25rem" }}>
                            {careers.map((c) => {
                              const hasAccess = allowedList.includes(c.slug);
                              return (
                                <form action={updateAllowedCareers} key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.125rem" }}>
                                  <input type="hidden" name="id" value={u.id} />
                                  <input type="hidden" name="careerSlug" value={c.slug} />
                                  <input type="hidden" name="action" value={hasAccess && u.allowedCareers ? "remove" : "add"} />
                                  <button type="submit" style={{ 
                                    background: "none", border: "none", cursor: "pointer", 
                                    color: hasAccess ? "var(--success-400)" : "var(--text-tertiary)",
                                    fontSize: "0.75rem", textAlign: "left", padding: 0
                                  }}>
                                    {hasAccess ? "✅" : "❌"} {c.name}
                                  </button>
                                </form>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {u.role === "ADMIN" ? "—" : isActive ? (
                        <div><span className="badge badge-success">Activa</span><div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.125rem" }}>hasta {formatDate(u.subscriptionExpiry)}</div></div>
                      ) : (<span className="badge badge-danger">Inactiva</span>)}
                    </td>
                    <td>{u._count.paymentRequests}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <form action={toggleSubscription}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="isActive" value={String(isActive)} />
                          <button type="submit" className={`btn btn-sm ${isActive ? "btn-secondary" : "btn-primary"}`} style={isActive ? { fontSize: "0.75rem" } : { background: "var(--success-400)", borderColor: "var(--success-400)", fontSize: "0.75rem" }}>
                            {isActive ? "Desactivar" : "Activar"} Suscripción
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );

              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error("AdminUsers Error:", error);
    return (
      <div className="solid-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar los usuarios.
        </p>
        <Link href="/admin/users" className="btn btn-primary">Reintentar</Link>
      </div>
    );
  }
}
