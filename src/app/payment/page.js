import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { uploadFile, generateReceiptKey } from "@/lib/s3";
import { isSubscriptionActive, daysRemaining, formatDate } from "@/lib/utils";

export const metadata = { title: "Suscripción y Pago" };
export const dynamic = "force-dynamic";

async function submitReceipt(formData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/auth/login");

  const file = formData.get("receipt");
  if (!file || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = generateReceiptKey(session.user.id, file.name);

  try {
    await uploadFile(buffer, key, file.type);
  } catch (e) {
    // If S3 is not configured, store a placeholder URL
    console.error("S3 upload failed:", e.message);
  }

  const receiptUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;

  await prisma.paymentRequest.create({
    data: {
      userId: session.user.id,
      receiptUrl,
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
    select: { subscriptionExpiry: true },
  });

  const payments = await prisma.paymentRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const subActive = isSubscriptionActive(user.subscriptionExpiry);
  const days = daysRemaining(user.subscriptionExpiry);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Suscripción 💳</h1>
          <p className="page-subtitle">Gestiona tu acceso a StudyHub</p>
        </div>
        <a href="/dashboard" className="btn" style={{ background: "var(--glass-bg)", border: "1px solid var(--border-default)", fontSize: "0.875rem" }}>
          ← Volver al inicio
        </a>
      </div>

      {reason === "expired" && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--warning-400)" }}>⚠️ Tu suscripción ha expirado. Envía un comprobante para reactivarla.</p>
        </div>
      )}

      {success && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--accent-400)" }}>✅ Comprobante enviado exitosamente. Un administrador lo revisará pronto.</p>
        </div>
      )}

      {/* Current Status */}
      <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Estado Actual</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={`badge ${subActive ? "badge-success" : "badge-danger"}`}>
            {subActive ? "Activa" : "Inactiva"}
          </span>
          {subActive && <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{days} días restantes — expira {formatDate(user.subscriptionExpiry)}</span>}
        </div>
      </div>

      {/* Payment Info */}
      <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
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
      <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>📷 Enviar Comprobante</h2>
        <form action={submitReceipt}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Foto del Comprobante</label>
            <input type="file" name="receipt" accept="image/*" required className="input" style={{ padding: "0.5rem" }} />
          </div>
          <button type="submit" className="btn btn-primary">Enviar Comprobante</button>
        </form>
      </div>

      {/* Payment History */}
      {payments.length > 0 && (
        <div className="solid-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-default)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Historial</h2>
          </div>
          <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead><tr><th>Fecha</th><th>Estado</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontSize: "0.8125rem" }}>{new Date(p.createdAt).toLocaleDateString("es-ES")}</td>
                    <td>
                      <span className={`badge ${p.status === "APPROVED" ? "badge-success" : p.status === "REJECTED" ? "badge-danger" : "badge-warning"}`}>
                        {p.status === "APPROVED" ? "Aprobado" : p.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
