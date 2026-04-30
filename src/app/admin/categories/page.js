import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = { title: "Gestión de Categorías" };
export const dynamic = "force-dynamic";

async function createCategory(formData) {
  "use server";
  await requireAdmin();
  const name = formData.get("name");
  const careerId = formData.get("careerId");
  const description = formData.get("description");
  const theory = formData.get("theory");

  await prisma.category.create({
    data: {
      name,
      slug: slugify(name),
      careerId,
      description: description || null,
      theory: theory || null,
    },
  });
  redirect(`/admin/categories?careerId=${careerId}`);
}

async function updateCategory(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  const theory = formData.get("theory");
  const careerId = formData.get("careerId");

  await prisma.category.update({
    where: { id },
    data: { theory: theory || null },
  });
  redirect(`/admin/categories?careerId=${careerId}`);
}

async function deleteCategory(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  const careerId = formData.get("careerId");
  await prisma.category.delete({ where: { id } });
  redirect(`/admin/categories?careerId=${careerId}`);
}

export default async function CategoriesPage({ searchParams }) {
  const params = await searchParams;
  const careerId = params?.careerId || "";

  try {
    const careers = await prisma.career.findMany({ orderBy: { name: "asc" } });

    const categories = careerId
      ? await prisma.category.findMany({
          where: { careerId },
          orderBy: { name: "asc" },
          include: {
            career: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        })
      : await prisma.category.findMany({
          orderBy: { name: "asc" },
          include: {
            career: { select: { name: true } },
            _count: { select: { questions: true } },
          },
        });

    const selectedCareer = careers.find((c) => c.id === careerId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">
            {selectedCareer
              ? `${categories.length} categorías en ${selectedCareer.name}`
              : `${categories.length} categorías en total`}
          </p>
        </div>
      </div>

      {/* Filter by Career */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Link href="/admin/categories" className={`btn btn-sm ${!careerId ? "btn-primary" : "btn-secondary"}`}>
          Todas
        </Link>
        {careers.map((c) => (
          <Link
            key={c.id}
            href={`/admin/categories?careerId=${c.id}`}
            className={`btn btn-sm ${careerId === c.id ? "btn-primary" : "btn-secondary"}`}
          >
            {c.icon || "📚"} {c.name}
          </Link>
        ))}
      </div>

      {/* Create Form */}
      {careers.length > 0 && (
        <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Nueva Categoría</h2>
          <form action={createCategory}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label htmlFor="cat-career" className="label">Carrera</label>
                <select id="cat-career" name="careerId" required className="select" defaultValue={careerId}>
                  <option value="">Seleccionar...</option>
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cat-name" className="label">Nombre</label>
                <input id="cat-name" name="name" required className="input" placeholder="Ej: Anatomía" />
              </div>
              <div>
                <label htmlFor="cat-desc" className="label">Descripción</label>
                <input id="cat-desc" name="description" className="input" placeholder="Opcional" />
              </div>
            </div>
            <div>
              <label htmlFor="cat-theory" className="label">Contenido de Teoría (Markdown/LaTeX)</label>
              <textarea 
                id="cat-theory" 
                name="theory" 
                className="input" 
                rows={5} 
                placeholder="Escribe aquí la teoría que verán los alumnos..."
                style={{ resize: "vertical", minHeight: "100px", fontFamily: "inherit" }}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} id="create-category-btn">
              Crear Categoría
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <div className="solid-card empty-state">
          <div className="empty-state-icon">📁</div>
          <p>No hay categorías{selectedCareer ? ` en ${selectedCareer.name}` : ""}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Carrera</th>
                <th>Preguntas</th>
                <th>Teoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{cat.name}</div>
                    {cat.description && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{cat.description}</div>
                    )}
                  </td>
                  <td>{cat.career.name}</td>
                  <td><span className="badge badge-primary">{cat._count.questions}</span></td>
                  <td>
                    <details>
                      <summary style={{ cursor: "pointer", fontSize: "0.8125rem", color: "var(--accent-400)" }}>
                        {cat.theory ? "Ver/Editar Teoría" : "Añadir Teoría"}
                      </summary>
                      <form action={updateCategory} style={{ marginTop: "0.5rem" }}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="hidden" name="careerId" value={careerId} />
                        <textarea 
                          name="theory" 
                          className="input" 
                          rows={4} 
                          defaultValue={cat.theory || ""}
                          placeholder="Markdown..."
                          style={{ fontSize: "0.8125rem", width: "100%", minWidth: "200px" }}
                        ></textarea>
                        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: "0.25rem" }}>
                          Guardar
                        </button>
                      </form>
                    </details>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/questions?categoryId=${cat.id}`} className="btn btn-ghost btn-sm">
                        Preguntas
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={cat.id} />
                        <input type="hidden" name="careerId" value={careerId} />
                        <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--danger-400)" }}>
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    );
  } catch (error) {
    console.error("AdminCategories Error:", error);
    return (
      <div className="solid-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar las categorías.
        </p>
        <Link href="/admin/categories" className="btn btn-primary">Reintentar</Link>
      </div>
    );
  }
}
