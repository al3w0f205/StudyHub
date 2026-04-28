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

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, image: true,
      subscriptionExpiry: true, isSuspended: true, createdAt: true,
      _count: { select: { paymentRequests: true } },
    },
  });

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
              <tr><th>Usuario</th><th>Rol</th><th>Suscripción</th><th>Estado</th><th>Pagos</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isActive = u.subscriptionExpiry && new Date(u.subscriptionExpiry) > new Date();
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
                      {u.role === "ADMIN" ? "—" : isActive ? (
                        <div><span className="badge badge-success">Activa</span><div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.125rem" }}>hasta {formatDate(u.subscriptionExpiry)}</div></div>
                      ) : (<span className="badge badge-danger">Inactiva</span>)}
                    </td>
                    <td>{u.isSuspended ? <span className="badge badge-danger">Suspendido</span> : <span className="badge badge-success">Activo</span>}</td>
                    <td>{u._count.paymentRequests}</td>
                    <td>
                      {u.role !== "ADMIN" && (
                        <form action={toggleSuspend}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="isSuspended" value={String(u.isSuspended)} />
                          <button type="submit" className={`btn btn-sm ${u.isSuspended ? "btn-primary" : "btn-danger"}`}>
                            {u.isSuspended ? "Reactivar" : "Suspender"}
                          </button>
                        </form>
                      )}
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
