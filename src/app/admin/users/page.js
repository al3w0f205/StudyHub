import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Gestión de Usuarios" };
export const dynamic = "force-dynamic";

async function toggleSuspend(formData) {
  "use server";
  const id = formData.get("id");
  const current = formData.get("isSuspended") === "true";
  await prisma.user.update({
    where: { id },
    data: {
      isSuspended: !current,
      suspendedReason: !current ? "Suspendido por administrador" : null,
    },
  });
  redirect("/admin/users");
}

async function grantSubscription(formData) {
  "use server";
  const id = formData.get("id");
  const days = parseInt(formData.get("days") || "30", 10);
  
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  
  await prisma.user.update({
    where: { id },
    data: { subscriptionExpiry: expiry },
  });
  redirect("/admin/users");
}

async function toggleRole(formData) {
  "use server";
  const id = formData.get("id");
  const currentRole = formData.get("role");
  
  await prisma.user.update({
    where: { id },
    data: { role: currentRole === "ADMIN" ? "USER" : "ADMIN" },
  });
  redirect("/admin/users");
}

async function updateAllowedCareers(formData) {
  "use server";
  const id = formData.get("id");
  const careerSlug = formData.get("careerSlug");
  const action = formData.get("action"); // 'add' or 'remove'
  
  const user = await prisma.user.findUnique({ where: { id }, select: { allowedCareers: true } });
  let allowed = user.allowedCareers ? user.allowedCareers.split(",").filter(c => c.trim()) : [];
  
  if (action === "add" && !allowed.includes(careerSlug)) allowed.push(careerSlug);
  if (action === "remove") allowed = allowed.filter(c => c !== careerSlug);
  
  await prisma.user.update({
    where: { id },
    data: { allowedCareers: allowed.length > 0 ? allowed.join(",") : null },
  });
  redirect("/admin/users");
}

export default async function UsersPage() {
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
              <tr><th>Usuario</th><th>Rol</th><th>Accesos (Carreras)</th><th>Suscripción</th><th>Estado</th><th>Pagos</th><th>Acciones</th></tr>
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
                          <img src={u.image} alt="" style={{ width: 32, height: 32, borderRadius: "var(--radius-full)" }} />
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
                      {u.role === "ADMIN" ? "Todas" : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {careers.map((c) => {
                            const hasAccess = allowedList.includes(c.slug) || !u.allowedCareers;
                            return (
                              <form action={updateAllowedCareers} key={c.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input type="hidden" name="id" value={u.id} />
                                <input type="hidden" name="careerSlug" value={c.slug} />
                                <input type="hidden" name="action" value={hasAccess && u.allowedCareers ? "remove" : "add"} />
                                <button type="submit" style={{ 
                                  background: "none", border: "none", cursor: "pointer", 
                                  color: hasAccess ? "var(--success-400)" : "var(--text-tertiary)",
                                  fontSize: "0.8rem", textAlign: "left", padding: 0
                                }}>
                                  {hasAccess ? "✅" : "❌"} {c.name}
                                </button>
                              </form>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td>
                      {u.role === "ADMIN" ? "—" : isActive ? (
                        <div><span className="badge badge-success">Activa</span><div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.125rem" }}>hasta {formatDate(u.subscriptionExpiry)}</div></div>
                      ) : (<span className="badge badge-danger">Inactiva</span>)}
                    </td>
                    <td>{u.isSuspended ? <span className="badge badge-danger">Suspendido</span> : <span className="badge badge-success">Activo</span>}</td>
                    <td>{u._count.paymentRequests}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {u.role !== "ADMIN" && (
                          <form action={toggleSuspend}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="isSuspended" value={String(u.isSuspended)} />
                            <button type="submit" className={`btn btn-sm ${u.isSuspended ? "btn-primary" : "btn-danger"}`}>
                              {u.isSuspended ? "Reactivar" : "Suspender"}
                            </button>
                          </form>
                        )}
                        <form action={grantSubscription}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="days" value="30" />
                          <button type="submit" className="btn btn-sm btn-ghost" style={{ color: "var(--accent-400)" }}>
                            +30 días
                          </button>
                        </form>
                        <form action={toggleRole}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="role" value={u.role} />
                          <button type="submit" className="btn btn-sm btn-ghost" style={{ color: "var(--warning-400)" }}>
                            {u.role === "ADMIN" ? "Quitar Admin" : "Hacer Admin"}
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
}
