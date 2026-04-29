import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isSubscriptionActive, daysRemaining, formatDate } from "@/lib/utils";
import { uploadToUploadThing } from "@/lib/uploadthing";
import { Building, Copy } from "lucide-react";

export const metadata = { title: "Suscripción y Pago" };
export const dynamic = "force-dynamic";

function parseTransferAccounts(rawValue) {
  return String(rawValue || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTransferAccountDetail(account) {
  // Split by dash, but handle cases with and without spaces
  const parts = String(account)
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    bank: parts[0] || null,
    accountType: parts[1] || null,
    accountNumber: parts[2] || null,
    owner: parts[3] || null,
    idNumber: parts[4] || null,
    raw: account,
  };
}

async function submitReceipt(formData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/auth/login");
  const existingPending = await prisma.paymentRequest.findFirst({
    where: { userId: session.user.id, status: "PENDING" },
    select: { id: true },
  });
  if (existingPending) {
    redirect("/payment?error=pending_exists");
  }

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
  const hasPendingError = params?.error === "pending_exists";
  const reason = params?.reason;
  const transferAccounts = parseTransferAccounts(
    process.env.NEXT_PUBLIC_TRANSFER_ACCOUNTS || process.env.TRANSFER_ACCOUNTS
  );

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
      {hasPendingError && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem", borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.05)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--warning-400)" }}>
            Ya tienes un pago pendiente de revisión. No puedes enviar otro comprobante todavía.
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
      <div className="solid-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", border: "1px solid var(--border-default)" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 800, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>💰</span> Información de Pago
        </h2>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "1rem", 
          marginBottom: "1.5rem" 
        }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-default)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Precio del Plan</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary-400)" }}>$10 USD <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", fontWeight: 500 }}>/ mes</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-lg)", padding: "1.25rem", border: "1px solid var(--border-default)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Tiempo de Espera</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--accent-400)" }}>&lt; 24h <span style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", fontWeight: 500 }}>aprobación</span></div>
          </div>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "20px", height: "1px", background: "var(--border-default)" }}></span>
            Cuentas para Transferir
            <span style={{ flex: 1, height: "1px", background: "var(--border-default)" }}></span>
          </h3>

          {transferAccounts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {transferAccounts.map((account, idx) => {
                const detail = parseTransferAccountDetail(account);
                // Simple color logic based on index or name
                const isPichincha = detail.bank?.toLowerCase().includes("pichincha");
                const cardAccent = isPichincha ? "var(--warning-400)" : "var(--primary-400)";
                const cardBg = isPichincha ? "rgba(245,158,11,0.03)" : "rgba(34,211,238,0.03)";
                const cardBorder = isPichincha ? "rgba(245,158,11,0.15)" : "rgba(34,211,238,0.15)";

                return (
                  <div
                    key={account}
                    className="animate-fade-in"
                    style={{
                      background: "var(--bg-tertiary)",
                      border: `1px solid ${cardBorder}`,
                      borderRadius: "var(--radius-xl)",
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 10px 30px -15px rgba(0,0,0,0.3)"
                    }}
                  >
                    {/* Decorative bank indicator */}
                    <div style={{ 
                      position: "absolute", top: 0, left: 0, width: "100%", height: "4px", 
                      background: cardAccent 
                    }} />

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ 
                        width: "44px", height: "44px", borderRadius: "12px", 
                        background: `${cardAccent}15`, display: "grid", placeItems: "center",
                        color: cardAccent, border: `1px solid ${cardAccent}30`
                      }}>
                        <Building size={24} />
                      </div>
                      <div>
                        <div style={{ fontSize: "1.125rem", fontWeight: 900, color: "white", letterSpacing: "-0.01em" }}>
                          {detail.bank || "Banco"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
                          {detail.accountType || "Cuenta"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.5rem" }}>
                      {/* Account Number Card */}
                      <div style={{ 
                        background: "rgba(0,0,0,0.25)", borderRadius: "var(--radius-lg)", 
                        padding: "1rem", border: "1px solid rgba(255,255,255,0.05)",
                        position: "relative"
                      }}>
                        <div style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.25rem" }}>Número de Cuenta</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "1.125rem", fontWeight: 800, color: cardAccent, fontFamily: "monospace" }}>{detail.accountNumber || "---"}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(detail.accountNumber);
                              const t = document.createElement('div');
                              t.className = 'badge badge-success';
                              t.style.position = 'fixed'; t.style.bottom = '30px'; t.style.right = '30px'; t.style.zIndex = '9999';
                              t.innerText = '¡Copiado!';
                              document.body.appendChild(t);
                              setTimeout(() => t.remove(), 2000);
                            }}
                            className="btn btn-sm"
                            style={{ padding: "0.4rem", minWidth: "32px", height: "32px", background: "rgba(255,255,255,0.05)" }}
                            title="Copiar Número"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", padding: "0.75rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                          <div style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.125rem" }}>Titular</div>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{detail.owner || "---"}</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)", padding: "0.75rem", border: "1px solid rgba(255,255,255,0.03)" }}>
                          <div style={{ fontSize: "0.625rem", color: "var(--text-tertiary)", fontWeight: 800, textTransform: "uppercase", marginBottom: "0.125rem" }}>CI / RIF</div>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 700 }}>{detail.idNumber || "---"}</div>
                        </div>
                      </div>

                      <button 
                         onClick={() => {
                          const text = `${detail.bank} - ${detail.accountNumber} - ${detail.owner} - ${detail.idNumber}`;
                          navigator.clipboard.writeText(text);
                          const t = document.createElement('div');
                          t.className = 'badge badge-success';
                          t.style.position = 'fixed'; t.style.bottom = '30px'; t.style.right = '30px'; t.style.zIndex = '9999';
                          t.innerText = '¡Toda la info copiada!';
                          document.body.appendChild(t);
                          setTimeout(() => t.remove(), 2000);
                        }}
                        className="btn btn-sm" 
                        style={{ width: "100%", background: "transparent", border: "1px dashed var(--border-default)", fontSize: "0.75rem", marginTop: "0.25rem", color: "var(--text-tertiary)" }}
                      >
                        Copiar todos los datos
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1rem", background: "rgba(255,255,255,0.01)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-default)" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>No hay cuentas configuradas actualmente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="solid-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem", opacity: pendingPayment ? 0.65 : 1 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>📷 Enviar Comprobante</h2>
        {pendingPayment && (
          <div style={{ marginBottom: "1rem", fontSize: "0.8125rem", color: "var(--warning-400)" }}>
            Ya tienes un comprobante pendiente de revisión. Debes esperar la respuesta del administrador antes de volver a enviar otro pago.
          </div>
        )}
        <form action={submitReceipt}>
          {/* Receipt upload */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Foto del Comprobante *</label>
            <input type="file" name="receipt" accept="image/*" required className="input" style={{ padding: "0.5rem" }} disabled={!!pendingPayment} />
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
                    disabled={!!pendingPayment}
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
              disabled={!!pendingPayment}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={!!pendingPayment}>
            {pendingPayment ? "Comprobante en Revisión" : "Enviar Comprobante"}
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
