import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Cuestionarios" };
export const dynamic = "force-dynamic";

import { auth } from "@/auth";

import QuizAgreement from "@/components/quiz/QuizAgreement";
import ClientStats from "@/app/dashboard/ClientStats";

export default async function QuizSelectorPage({ searchParams }) {
  const params = await searchParams;
  const selectedCareerSlug = params.career;
  
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, allowedCareers: true, role: true }
  });

  // Admin has access to everything
  const isAdmin = user.role === "ADMIN";

  let careers = await prisma.career.findMany({
    orderBy: { name: "asc" },
    include: {
      categories: {
        orderBy: { name: "asc" },
        include: { 
          _count: { select: { questions: true } },
          theory: true
        },
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

  // --- Fetch Data for Stats ---
  const allCategories = await prisma.category.findMany({
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
  // ----------------------------

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1.25rem" }}>
      <QuizAgreement />
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: "clamp(1.5rem, 5vw, 1.875rem)" }}>
            Hola, {user.name?.split(" ")[0] || "Estudiante"} 👋
          </h1>
          <p className="page-subtitle" style={{ fontSize: "0.875rem" }}>Panel de estudio interactivo</p>
        </div>
        <Link href="/settings" className="btn btn-secondary" style={{ borderRadius: "var(--radius-full)", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
          ⚙️ Ajustes
        </Link>
      </div>

      {!noAccess && (
        <ClientStats categories={allCategories} progress={progressMap} />
      )}

      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", marginTop: noAccess ? "0" : "1rem" }}>
        Módulos Disponibles
      </h2>

      {!noAccess && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ 
            display: "flex", 
            gap: "0.5rem", 
            overflowX: "auto", 
            paddingBottom: "1rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
            {careers.map((career) => (
              <Link
                key={career.id}
                href={`/quiz?career=${career.slug}`}
                className="btn"
                style={{
                  borderRadius: "var(--radius-full)",
                  background: (selectedCareerSlug === career.slug || (!selectedCareerSlug && careers[0]?.slug === career.slug)) 
                    ? "var(--gradient-primary)" 
                    : "var(--bg-card)",
                  color: (selectedCareerSlug === career.slug || (!selectedCareerSlug && careers[0]?.slug === career.slug))
                    ? "white"
                    : "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.875rem",
                  whiteSpace: "nowrap"
                }}
              >
                {career.icon} {career.name}
              </Link>
            ))}
          </div>
        </div>
      )}

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
          {careers
            .filter(c => !selectedCareerSlug ? c.id === careers[0]?.id : c.slug === selectedCareerSlug)
            .map((career) => (
            <div key={career.id} style={{ animation: "fadeIn 0.3s ease-out" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{career.icon || "📚"}</span>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)" }}>{career.name}</h2>
                  {career.description && <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>{career.description}</p>}
                </div>
              </div>
              
              {career.categories.length === 0 ? (
                <div className="solid-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-tertiary)" }}>No hay categorías disponibles</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {career.categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      href={`/quiz/${cat.id}`} 
                      className="solid-card" 
                      style={{ 
                        padding: "1.25rem", 
                        textDecoration: "none", 
                        display: "flex", 
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "100px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>{cat.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                            {cat._count.questions} preguntas
                          </span>
                          {cat.theory && (
                            <span title="Teoría disponible" style={{ fontSize: "0.75rem", background: "rgba(34,211,238,0.1)", color: "var(--accent-400)", padding: "0.125rem 0.375rem", borderRadius: "4px", fontWeight: "600" }}>
                              📄 Teoría
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ alignSelf: "flex-end", fontSize: "0.75rem", fontWeight: "600", color: "var(--accent-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        Empezar →
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
