import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = { title: "Gestión de Carreras" };
export const dynamic = "force-dynamic";

async function createCareer(formData) {
  "use server";
  await requireAdmin();
  const name = formData.get("name");
  const description = formData.get("description");
  const icon = formData.get("icon");

  await prisma.career.create({
    data: {
      name,
      slug: slugify(name),
      description: description || null,
      icon: icon || null,
    },
  });
  redirect("/admin/careers");
}

async function deleteCareer(formData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id");
  await prisma.career.delete({ where: { id } });
  redirect("/admin/careers");
}

export default async function CareersPage() {
  await requireAdmin();
  try {
    const careers = await prisma.career.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { categories: true } } },
    });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Carreras</h1>
          <p className="page-subtitle">{careers.length} carrera{careers.length !== 1 ? "s" : ""} registrada{careers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Create Form */}
      <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}>Nueva Carrera</h2>
        <form action={createCareer}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
            <div>
              <label htmlFor="career-name" className="label">Nombre</label>
              <input id="career-name" name="name" required className="input" placeholder="Ej: Medicina" />
            </div>
            <div>
              <label htmlFor="career-desc" className="label">Descripción</label>
              <input id="career-desc" name="description" className="input" placeholder="Opcional" />
            </div>
            <div>
              <label htmlFor="career-icon" className="label">Ícono</label>
              <input id="career-icon" name="icon" className="input" placeholder="🏥" style={{ width: "80px" }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }} id="create-career-btn">
            Crear Carrera
          </button>
        </form>
      </div>

      {/* List */}
      {careers.length === 0 ? (
        <div className="solid-card empty-state">
          <div className="empty-state-icon">🎓</div>
          <p>No hay carreras registradas</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Carrera</th>
                <th>Slug</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((career) => (
                <tr key={career.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{career.icon || "📚"}</span>
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{career.name}</div>
                        {career.description && (
                          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{career.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{career.slug}</code></td>
                  <td><span className="badge badge-primary">{career._count.categories}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link href={`/admin/categories?careerId=${career.id}`} className="btn btn-ghost btn-sm">
                        Ver categorías
                      </Link>
                      <form action={deleteCareer}>
                        <input type="hidden" name="id" value={career.id} />
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
    console.error("AdminCareers Error:", error);
    return (
      <div className="solid-card" style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar las carreras.
        </p>
        <Link href="/admin/careers" className="btn btn-primary">Reintentar</Link>
      </div>
    );
  }
}
