import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Cuestionarios" };
export const dynamic = "force-dynamic";

import { auth } from "@/auth";

import QuizAgreement from "@/components/quiz/QuizAgreement";

export default async function QuizSelectorPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { allowedCareers: true, role: true }
  });

  // Admin has access to everything
  const isAdmin = user.role === "ADMIN";

  let careers = await prisma.career.findMany({
    orderBy: { name: "asc" },
    include: {
      categories: {
        orderBy: { name: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  // For regular users: filter to allowed careers only
  // null or "" = no access (inverted from previous logic)
  if (!isAdmin) {
    if (!user.allowedCareers || user.allowedCareers.trim() === "") {
      careers = [];
    } else {
      const allowed = user.allowedCareers.split(",").filter(Boolean);
      careers = careers.filter(c => allowed.includes(c.slug));
    }
  }

  const noAccess = !isAdmin && (!user.allowedCareers || user.allowedCareers.trim() === "");

  return (
    <div>
      <QuizAgreement />
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuestionarios 📝</h1>
          <p className="page-subtitle">Selecciona una carrera y categoría para comenzar</p>
        </div>
      </div>

      {noAccess ? (
        <div className="solid-card" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.6 }}>🔒</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>Acceso No Habilitado</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.6, maxWidth: 450, margin: "0 auto 1.5rem" }}>
            Tu cuenta aún no tiene carreras habilitadas. Envía tu comprobante de pago y un administrador te asignará las carreras correspondientes.
          </p>
          <Link href="/payment" className="btn btn-primary">
            Ir a Suscripción
          </Link>
        </div>
      ) : careers.length === 0 ? (
        <div className="solid-card empty-state">
          <div className="empty-state-icon">📚</div>
          <p>No hay carreras disponibles aún</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {careers.map((career) => (
            <div key={career.id} className="solid-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{career.icon || "📚"}</span>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: "700" }}>{career.name}</h2>
                  {career.description && <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>{career.description}</p>}
                </div>
              </div>
              {career.categories.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>No hay categorías disponibles</div>
              ) : (
                <div style={{ padding: "0.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem" }}>
                  {career.categories.map((cat) => (
                    <Link key={cat.id} href={`/quiz/${cat.id}`} className="solid-card" style={{ padding: "0.875rem", textDecoration: "none", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontWeight: "600", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>{cat.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {cat._count.questions} pregunta{cat._count.questions !== 1 ? "s" : ""}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
