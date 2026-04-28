import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getPresignedUrl } from "@/lib/s3";

export const metadata = { title: "Gestión de Pagos" };
export const dynamic = "force-dynamic";

async function approvePayment(formData) {
  "use server";
  const id = formData.get("id");
  const userId = formData.get("userId");
  const requestedCareers = formData.get("requestedCareers");

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);

  const userUpdateData = { subscriptionExpiry: expiry };
  
  if (requestedCareers) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { allowedCareers: true } });
    let allowed = user.allowedCareers ? user.allowedCareers.split(",").filter(Boolean) : [];
    
    // Add requested careers that aren't already there
    const requested = requestedCareers.split(",");
    for (const c of requested) {
      if (!allowed.includes(c)) allowed.push(c);
    }
    
    userUpdateData.allowedCareers = allowed.join(",");
  }

  await prisma.$transaction([
    prisma.paymentRequest.update({ where: { id }, data: { status: "APPROVED", reviewedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: userUpdateData }),
  ]);
  redirect("/admin/payments");
}

async function rejectPayment(formData) {
  "use server";
  const id = formData.get("id");
  const notes = formData.get("notes");
  await prisma.paymentRequest.update({ where: { id }, data: { status: "REJECTED", adminNotes: notes || "Rechazado", reviewedAt: new Date() } });
  redirect("/admin/payments");
}

export default async function PaymentsPage() {
  const payments = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const pending = payments.filter((p) => p.status === "PENDING");
  const reviewed = payments.filter((p) => p.status !== "PENDING");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes de Pago</h1>
          <p className="page-subtitle">{pending.length} pendiente{pending.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Pending */}
      <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>⏳ Pendientes</h2>
      {pending.length === 0 ? (
        <div className="solid-card empty-state" style={{ marginBottom: "2rem" }}>
          <div className="empty-state-icon">✅</div>
          <p>No hay pagos pendientes</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
          {pending.map((p) => (
            <div key={p.id} className="solid-card" style={{ padding: "1.25rem", borderColor: "rgba(245,158,11,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>{p.user.name || p.user.email}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{p.user.email}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                    {new Date(p.createdAt).toLocaleString("es-ES")}
                  </div>
                  {p.requestedCareers && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.375rem" }}>
                      <strong>Solicita:</strong> {p.requestedCareers.split(",").join(", ")}
                    </div>
                  )}
                  {p.userComment && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.375rem", fontStyle: "italic", background: "var(--glass-bg)", padding: "0.5rem", borderRadius: "var(--radius-sm)" }}>
                      "{p.userComment}"
                    </div>
                  )}
                  <a href={p.receiptUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" style={{ marginTop: "0.5rem", paddingLeft: 0 }}>
                    📷 Ver Comprobante
                  </a>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", alignItems: "flex-end" }}>
                  <form action={approvePayment}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="userId" value={p.userId} />
                    <input type="hidden" name="requestedCareers" value={p.requestedCareers || ""} />
                    <button type="submit" className="btn btn-primary btn-sm">✓ Aprobar (+30 días)</button>
                  </form>
                  <form action={rejectPayment} style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="text" name="notes" placeholder="Motivo del rechazo..." className="input" style={{ width: "150px", padding: "0.375rem 0.5rem", fontSize: "0.75rem" }} />
                    <button type="submit" className="btn btn-danger btn-sm">✕ Rechazar</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <>
          <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>📋 Historial</h2>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Usuario</th><th>Estado</th><th>Fecha</th><th>Notas</th></tr></thead>
              <tbody>
                {reviewed.map((p) => (
                  <tr key={p.id}>
                    <td>{p.user.name || p.user.email}</td>
                    <td><span className={`badge ${p.status === "APPROVED" ? "badge-success" : "badge-danger"}`}>{p.status === "APPROVED" ? "Aprobado" : "Rechazado"}</span></td>
                    <td style={{ fontSize: "0.8125rem" }}>{p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString("es-ES") : "—"}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>{p.adminNotes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
