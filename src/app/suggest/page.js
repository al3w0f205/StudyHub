import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = { title: "Sugerir Pregunta" };
export const dynamic = "force-dynamic";

async function submitSuggestion(formData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/auth/login");

  const text = formData.get("text");
  const categoryId = formData.get("categoryId");
  const hint = formData.get("hint");
  const explanation = formData.get("explanation");

  const options = [];
  for (let i = 0; i < 4; i++) {
    const opt = formData.get(`option-${i}`);
    if (opt && opt.trim()) options.push(opt.trim());
  }

  if (!text || options.length < 2) return;

  await prisma.questionSuggestion.create({
    data: {
      userId: session.user.id,
      text,
      options,
      categoryId: categoryId || null,
      hint: hint || null,
      explanation: explanation || null,
    },
  });

  redirect("/suggest?success=true");
}

export default async function SuggestPage({ searchParams }) {
  const params = await searchParams;
  const success = params?.success === "true";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { career: { select: { name: true } } },
  });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sugerir Pregunta 💡</h1>
          <p className="page-subtitle">Propón preguntas para ayudar a otros estudiantes</p>
        </div>
      </div>

      {success && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem 1.5rem", marginBottom: "1.5rem", borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--accent-400)" }}>✅ ¡Gracias! Tu sugerencia ha sido enviada. Un administrador la revisará.</p>
        </div>
      )}

      <div className="solid-card" style={{ padding: "1.5rem" }}>
        <form action={submitSuggestion}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="label">Categoría (opcional)</label>
              <select name="categoryId" className="select">
                <option value="">Sin categoría específica</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.career.name} → {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Texto de la Pregunta *</label>
              <textarea name="text" required className="input textarea" placeholder="Escribe tu pregunta aquí..." style={{ minHeight: "120px" }} />
            </div>

            <div>
              <label className="label">Opciones de Respuesta (mín. 2)</label>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {[0, 1, 2, 3].map((i) => (
                  <input key={i} name={`option-${i}`} className="input" placeholder={`Opción ${i + 1}${i < 2 ? " *" : " (opcional)"}`} required={i < 2} />
                ))}
              </div>
            </div>

            <div>
              <label className="label">Pista (opcional)</label>
              <input name="hint" className="input" placeholder="Una pista para guiar al estudiante" />
            </div>

            <div>
              <label className="label">Justificación (opcional)</label>
              <textarea name="explanation" className="input textarea" placeholder="Explica por qué esta es la respuesta correcta" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Enviar Sugerencia
          </button>
        </form>
      </div>
    </div>
  );
}
