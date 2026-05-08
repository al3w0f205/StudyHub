import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Gestión de Carreras" };
export const dynamic = "force-dynamic";

async function createCareer(formData: FormData) {
  "use server";
  await requireAdmin();
  const name = formData.get("name") as string;
  const universityId = formData.get("universityId") as string;
  const description = formData.get("description") as string | null;
  const icon = formData.get("icon") as string | null;

  await prisma.career.create({
    data: {
      name,
      slug: slugify(name),
      description: description || null,
      icon: icon || null,
      universityId,
    },
  });
  
  revalidatePath("/admin/careers");
  redirect("/admin/careers");
}

async function deleteCareer(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.career.delete({ where: { id } });
  
  revalidatePath("/admin/careers");
  redirect("/admin/careers");
}

export default async function CareersPage() {
  await requireAdmin();
  
  let careers: any[] = [], universities: any[] = [];
  let hasError = false;
  try {
    [careers, universities] = await Promise.all([
      prisma.career.findMany({
        orderBy: { name: "asc" },
        include: { 
          university: true,
          _count: { select: { categories: true } } 
        },
      }),
      prisma.university.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch (error) {
    console.error("AdminCareers Error:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div
        className="solid-card"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <h2 style={{ marginBottom: "1rem" }}>⚠️ Error de Base de Datos</h2>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "1.5rem" }}>
          No pudimos conectar con la base de datos para cargar las carreras.
        </p>
        <Link href="/admin/careers" className="btn btn-primary">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Carreras</h1>
          <p className="page-subtitle">
            {careers.length} {careers.length === 1 ? "carrera registrada" : "carreras registradas"}
          </p>
        </div>
      </div>

      {/* Create Form */}
      <div
        className="solid-card"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h2
          style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem" }}
        >
          Nueva Carrera
        </h2>
        <form action={createCareer}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "0.75rem",
              alignItems: "end",
            }}
          >
            <div>
              <label htmlFor="career-name" className="label">
                Nombre
              </label>
              <input
                id="career-name"
                name="name"
                required
                className="input"
                placeholder="Ej: Medicina"
              />
            </div>
            <div>
              <label htmlFor="career-uni" className="label">
                Universidad
              </label>
              <select
                id="career-uni"
                name="universityId"
                required
                className="input"
                style={{ appearance: "auto" }}
              >
                <option value="">Seleccionar...</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="career-icon" className="label">
                Ícono
              </label>
              <input
                id="career-icon"
                name="icon"
                className="input"
                placeholder="🏥"
                style={{ width: "80px" }}
              />
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label htmlFor="career-desc" className="label">
              Descripción
            </label>
            <input
              id="career-desc"
              name="description"
              className="input"
              placeholder="Opcional"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
            id="create-career-btn"
          >
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
                <th>Universidad</th>
                <th>Slug</th>
                <th>Categorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {careers.map((career) => (
                <tr key={career.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span>{career.icon || "📚"}</span>
                      <div>
                        <div
                          style={{
                            fontWeight: "600",
                            color: "var(--text-primary)",
                          }}
                        >
                          {career.name}
                        </div>
                        {career.description && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {career.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                      {career.university?.name || "Sin Universidad"}
                    </span>
                  </td>
                  <td>
                    <code
                      style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
                    >
                      {career.slug}
                    </code>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {career._count.categories}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Link
                        href={`/admin/categories?careerId=${career.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Ver categorías
                      </Link>
                      <form action={deleteCareer}>
                        <input type="hidden" name="id" value={career.id} />
                        <button
                          type="submit"
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--danger-400)" }}
                        >
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
}
