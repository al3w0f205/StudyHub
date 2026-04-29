import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSubscriptionActive, daysRemaining, formatDate } from "@/lib/utils";
import { uploadToUploadThing } from "@/lib/uploadthing";

export const metadata = { title: "Suscripción y Pago" };
export const dynamic = "force-dynamic";

async function submitReceipt(formData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/auth/login");

  const file = formData.get("receipt");
  if (!file || file.size === 0) return;

  const userComment = formData.get("userComment") || null;
  const requestedCareers = formData.getAll("requestedCareers").filter(Boolean).join(",") || null;

  let receiptUrl = "";
  try {
    receiptUrl = await uploadToUploadThing(file);
  } catch (e) {
    console.error("UploadThing upload failed:", e.message);
    // Fallback or handle error
    redirect("/payment?error=upload_failed");
  }

  await prisma.paymentRequest.create({
    data: {
      userId: session.user.id,
      receiptUrl,
      userComment,
      requestedCareers,
    },
  });

  redirect("/payment?success=true");
}


export default async function PaymentPage({ searchParams }) {
  const session = await auth();
  const params = await searchParams;
  const success = params?.success === "true";
  const reason = params?.reason;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionExpiry: true, allowedCareers: true },
  });

  const payments = await prisma.paymentRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const careers = await prisma.career.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });

  const subActive = isSubscriptionActive(user.subscriptionExpiry);
  const days = daysRemaining(user.subscriptionExpiry);
  const pendingPayment = payments.find((p) => p.status === "PENDING");
  const allowedList = user.allowedCareers ? user.allowedCareers.split(",").filter(Boolean) : [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">Suscripción 💳</h1>
          <p className="page-subtitle">Gestiona tu acceso a StudyHub</p>
        </div>
        <a href="/dashboard" className="btn" style={{ background: "var(--glass-bg)", border: "1px solid var(--border-default)", fontSize: "0.875rem" }}>
          ← Volver al inicio
        </a>
      </div>

      {/* Expired warning */}
      {reason === "expired" && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--warning-400)" }}>⚠️ Tu suscripción ha expirado. Envía un comprobante para reactivarla.</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="solid-card animate-fade-in" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <strong style={{ color: "var(--accent-400)", fontSize: "1rem" }}>¡Comprobante Enviado!</strong>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Tu comprobante ha sido enviado exitosamente. Un administrador lo revisará y te habilitará el acceso en un máximo de <strong style={{ color: "var(--text-primary)" }}>24 horas</strong>.
          </p>
        </div>
      )}

      {/* Pending payment banner */}
      {pendingPayment && !success && (
        <div className="solid-card animate-fade-in" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⏳</span>
            <strong style={{ color: "var(--warning-400)", fontSize: "1rem" }}>Pago en Revisión</strong>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Tu comprobante del {new Date(pendingPayment.createdAt).toLocaleDateString("es-ES")} está siendo revisado. Recibirás acceso una vez que sea aprobado.
          </p>
        </div>
      )}

      {/* Current Status */}
      <div className="solid-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Estado Actual</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <span className={`badge ${subActive ? "badge-success" : "badge-danger"}`}>
            {subActive ? "Activa" : "Inactiva"}
          </span>
          {subActive && <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{days} días restantes — expira {formatDate(user.subscriptionExpiry)}</span>}
        </div>
        {allowedList.length > 0 && (
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-default)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Carreras Habilitadas</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {careers.filter(c => allowedList.includes(c.slug)).map(c => (
                <span key={c.id} className="badge badge-success">{c.icon || "📚"} {c.name}</span>
              ))}
            </div>
          </div>
        )}
        {(!user.allowedCareers || user.allowedCareers === "") && (
          <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-default)" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
              ⚠️ Aún no tienes carreras habilitadas. Envía tu comprobante de pago y selecciona las carreras que necesitas.
            </p>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="solid-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>💰 Información de Pago</h2>
        <div style={{ background: "var(--glass-bg)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1rem", border: "1px solid var(--border-default)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
            <strong style={{ color: "var(--text-primary)" }}>Precio:</strong> $10 USD / mes<br/>
            <strong style={{ color: "var(--text-primary)" }}>Método:</strong> Transferencia bancaria<br/>
            <strong style={{ color: "var(--text-primary)" }}>Proceso:</strong> Envía tu comprobante y un admin aprobará tu acceso en menos de 24h.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="solid-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>📷 Enviar Comprobante</h2>
        <form action={submitReceipt}>
          {/* Receipt upload */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Foto del Comprobante *</label>
            <input type="file" name="receipt" accept="image/*" required className="input" style={{ padding: "0.5rem" }} />
          </div>

          {/* Career selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">¿Qué carreras necesitas? (selecciona las que apliquen)</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem", marginTop: "0.5rem" }}>
              {careers.map((c) => (
                <label key={c.id} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.625rem 0.75rem", background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)", cursor: "pointer",
                  border: "1px solid var(--border-default)",
                  fontSize: "0.8125rem", fontWeight: 500,
                  transition: "all 0.15s ease",
                }}>
                  <input
                    type="checkbox"
                    name="requestedCareers"
                    value={c.slug}
                    defaultChecked={allowedList.includes(c.slug)}
                    style={{ accentColor: "var(--accent-400)", width: 16, height: 16 }}
                  />
                  <span>{c.icon || "📚"} {c.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* User comment */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label className="label">Comentario (opcional)</label>
            <textarea
              name="userComment"
              placeholder="Escribe cualquier información relevante sobre tu pago, solicitud o dudas..."
              className="input textarea"
              style={{ minHeight: 80, resize: "vertical" }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Enviar Comprobante
          </button>
        </form>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="solid-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-default)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Historial</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {payments.map((p) => (
              <div key={p.id} style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border-default)",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                flexWrap: "wrap", gap: "0.5rem",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span className={`badge ${p.status === "APPROVED" ? "badge-success" : p.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                      {p.status === "APPROVED" ? "✅ Aprobado" : p.status === "REJECTED" ? "❌ Rechazado" : "⏳ Pendiente"}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      {new Date(p.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  {p.requestedCareers && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                      Carreras solicitadas: {p.requestedCareers.split(",").join(", ")}
                    </div>
                  )}
                  {p.userComment && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem", fontStyle: "italic" }}>
                      &ldquo;{p.userComment}&rdquo;
                    </div>
                  )}
                  {p.status === "REJECTED" && p.adminNotes && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--danger-400)", marginTop: "0.375rem", padding: "0.5rem 0.75rem", background: "rgba(244,63,94,0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(244,63,94,0.15)" }}>
                      <strong>Motivo:</strong> {p.adminNotes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
