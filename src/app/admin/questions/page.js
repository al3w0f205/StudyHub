import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { truncate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = { title: "Gestión de Preguntas" };
export const dynamic = "force-dynamic";

async function createQuestion(formData) {
  "use server";
  await requireAdmin();
  const text = formData.get("text");
  const categoryId = formData.get("categoryId");
  const correctIndex = parseInt(formData.get("correctIndex"), 10);
  const hint = formData.get("hint");
  const explanation = formData.get("explanation");
  const options = [];
  for (let i = 0; i < 4; i++) {
    const opt = formData.get(`option-${i}`);
    if (opt && opt.trim()) options.push(opt.trim());
  }
  if (options.length < 2 || correctIndex < 0 || correctIndex >= options.length) return;
  await prisma.question.create({
    data: { text, options, correctIndex, categoryId, hint: hint || null, explanation: explanation || null },
  });
  redirect(`/admin/questions?categoryId=${categoryId}`);
}

async function deleteQuestion(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  await prisma.question.delete({ where: { id } });
  redirect("/admin/questions");
}

export default async function QuestionsPage({ searchParams }) {
  const params = await searchParams;
  const categoryId = params?.categoryId || "";
  const page = parseInt(params?.page || "1", 10);
  const perPage = 20;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { career: { select: { name: true } } },
    });
    const where = categoryId ? { categoryId } : {};
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where, orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true, career: { select: { name: true } } } } },
        skip: (page - 1) * perPage, take: perPage,
      }),
      prisma.question.count({ where }),
    ]);
    const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Preguntas</h1>
          <p className="page-subtitle">{total} pregunta{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {categories.length > 0 && (
        <details className="solid-card" style={{ marginBottom: "1.5rem" }}>
          <summary style={{ padding: "1rem 1.5rem", cursor: "pointer", fontWeight: "700" }}>➕ Nueva Pregunta</summary>
          <form action={createQuestion} style={{ padding: "0 1.5rem 1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label className="label">Categoría</label>
                <select name="categoryId" required className="select" defaultValue={categoryId}>
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.career.name} → {c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="label">Texto</label>
                <textarea name="text" required className="input textarea" placeholder="Pregunta..." />
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {[0,1,2,3].map(i => (<input key={i} name={`option-${i}`} className="input" placeholder={`Opción ${i+1}`} required={i < 2} />))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div><label className="label">Correcta (0-3)</label><input name="correctIndex" type="number" min="0" max="3" required className="input" defaultValue="0" /></div>
                <div><label className="label">Pista</label><input name="hint" className="input" /></div>
                <div><label className="label">Justificación</label><input name="explanation" className="input" /></div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>Crear</button>
          </form>
        </details>
      )}

      {questions.length === 0 ? (
        <div className="solid-card empty-state"><div className="empty-state-icon">❓</div><p>No hay preguntas</p></div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {questions.map((q) => (
            <div key={q.id} className="solid-card" style={{ padding: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
                {q.category.career.name} → {q.category.name}
              </div>
              <p style={{ fontWeight: "600", fontSize: "0.875rem", marginBottom: "0.75rem" }}>{truncate(q.text, 200)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem", marginBottom: "0.5rem" }}>
                {q.options.map((opt, i) => (
                  <div key={i} style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem", borderRadius: "var(--radius-sm)", background: i === q.correctIndex ? "rgba(16,185,129,0.1)" : "var(--glass-bg)", border: `1px solid ${i === q.correctIndex ? "rgba(16,185,129,0.3)" : "var(--border-default)"}`, color: i === q.correctIndex ? "var(--accent-400)" : "var(--text-secondary)" }}>
                    {i === q.correctIndex && "✓ "}{opt}
                  </div>
                ))}
              </div>
              <form action={deleteQuestion} style={{ display: "inline" }}>
                <input type="hidden" name="id" value={q.id} />
                <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--danger-400)" }}>Eliminar</button>
              </form>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          {page > 1 && <a href={`/admin/questions?${categoryId ? `categoryId=${categoryId}&` : ""}page=${page-1}`} className="btn btn-secondary btn-sm">← Ant.</a>}
          <span style={{ padding: "0 1rem", fontSize: "0.875rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center" }}>{page}/{totalPages}</span>
          {page < totalPages && <a href={`/admin/questions?${categoryId ? `categoryId=${categoryId}&` : ""}page=${page+1}`} className="btn btn-secondary btn-sm">Sig. →</a>}
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error("AdminQuestions Error:", error);
    return (
      <div className="solid-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar las preguntas.
        </p>
        <Link href="/admin/questions" className="btn btn-primary">Reintentar</Link>
      </div>
    );
  }
}
