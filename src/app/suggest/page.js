import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = { title: "Sugerir Pregunta" };
export const dynamic = "force-dynamic";

async function submitSuggestion(formData) {
  "use server";
  const session = await auth();
  if (!session) redirect("/auth/login");

  const text = String(formData.get("text") || "").trim();
  const categoryId = String(formData.get("categoryId") || "").trim();
  const hint = String(formData.get("hint") || "").trim();
  const explanation = String(formData.get("explanation") || "").trim();

  const options = [];
  const correctIndex = Number.parseInt(String(formData.get("correctIndex") || ""), 10);

  for (let i = 0; i < 4; i++) {
    const opt = formData.get(`option-${i}`);
    if (opt && opt.trim()) options.push(opt.trim());
  }

  if (!text || text.length > 2000 || options.length < 2 || Number.isNaN(correctIndex)) return;
  if (correctIndex < 0 || correctIndex >= options.length) return;
  if (hint.length > 1000 || explanation.length > 5000) return;

  let validCategoryId = null;
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) return;
    validCategoryId = category.id;
  }

  await prisma.questionSuggestion.create({
    data: {
      userId: session.user.id,
      text,
      options,
      correctIndex,
      categoryId: validCategoryId,
      hint: hint || null,
      explanation: explanation || null,
    },
  });

  // Award badge
  try {
    const badge = await prisma.badge.findUnique({ where: { slug: "suggest_question" } });
    if (badge) {
      await prisma.userBadge.create({
        data: { userId: session.user.id, badgeId: badge.id }
      }).catch(() => {}); // Ignore if already earned
    }
  } catch (e) {
    console.error("Error awarding suggestion badge:", e);
  }

  redirect("/suggest?success=true");
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SuggestPage({ searchParams }) {
  const params = await searchParams;
  const success = params?.success === "true";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { career: { select: { name: true } } },
  });

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/quiz" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", paddingLeft: 0, color: "var(--text-tertiary)" }}>
          <ArrowLeft size={18} /> Regresar al Menú
        </Link>
      </div>

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
              <label className="label">Opciones de Respuesta (selecciona la correcta ✔️)</label>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <input type="radio" name="correctIndex" value={i} required style={{ width: "20px", height: "20px", accentColor: "var(--success-400)", cursor: "pointer" }} />
                    <input name={`option-${i}`} className="input" placeholder={`Opción ${i + 1}${i < 2 ? " *" : " (opcional)"}`} required={i < 2} style={{ flex: 1 }} />
                  </div>
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
