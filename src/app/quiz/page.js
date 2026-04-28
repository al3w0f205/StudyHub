import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "Cuestionarios" };
export const dynamic = "force-dynamic";

export default async function QuizSelectorPage() {
  const careers = await prisma.career.findMany({
    orderBy: { name: "asc" },
    include: {
      categories: {
        orderBy: { name: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuestionarios 📝</h1>
          <p className="page-subtitle">Selecciona una carrera y categoría para comenzar</p>
        </div>
      </div>

      {careers.length === 0 ? (
        <div className="solid-card empty-state">
          <div className="empty-state-icon">📚</div>
          <p>No hay carreras disponibles aún</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {careers.map((career) => (
            <div key={career.id} className="solid-card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{career.icon || "📚"}</span>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: "700" }}>{career.name}</h2>
                  {career.description && <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>{career.description}</p>}
                </div>
              </div>
              {career.categories.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>No hay categorías disponibles</div>
              ) : (
                <div style={{ padding: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
                  {career.categories.map((cat) => (
                    <Link key={cat.id} href={`/quiz/${cat.id}`} className="solid-card" style={{ padding: "1rem", textDecoration: "none", border: "1px solid var(--border-default)" }}>
                      <div style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{cat.name}</div>
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
