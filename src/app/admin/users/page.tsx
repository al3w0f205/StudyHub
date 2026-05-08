import Image from "next/image";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guards";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = { title: "Gestión de Usuarios" };
export const dynamic = "force-dynamic";

async function toggleSubscription(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";

  await prisma.user.update({
    where: { id },
    data: {
      subscriptionExpiry: isActive
        ? null
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  redirect("/admin/users");
}

async function updateAccess(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = formData.get("id") as string;
  const careerSlug = formData.get("careerSlug") as string | null;
  const universitySlug = formData.get("universitySlug") as string | null;
  const action = formData.get("action") as string;

  const [user, allCareers, allUniversities] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { allowedCareers: true, allowedUniversities: true, subscriptionExpiry: true },
    }),
    prisma.career.findMany({ select: { slug: true, universityId: true, university: { select: { slug: true } } } }),
    prisma.university.findMany({ select: { slug: true, careers: { select: { slug: true } } } }),
  ]);

  if (!user) redirect("/admin/users");

  let allowedCareers = user.allowedCareers
    ? user.allowedCareers.split(",").filter((c: string) => c.trim())
    : [];
  
  let allowedUnis = user.allowedUniversities
    ? user.allowedUniversities.split(",").filter((u: string) => u.trim())
    : [];

  if (universitySlug) {
    // Handle University Level Toggle
    const uni = allUniversities.find((u: any) => u.slug === universitySlug);
    if (uni) {
      const uniCareerSlugs = uni.careers.map((c: any) => c.slug);
      if (action === "add") {
        if (!allowedUnis.includes(universitySlug)) allowedUnis.push(universitySlug);
        // Add all careers of this uni
        uniCareerSlugs.forEach((slug: string) => {
          if (!allowedCareers.includes(slug)) allowedCareers.push(slug);
        });
      } else {
        allowedUnis = allowedUnis.filter((u: string) => u !== universitySlug);
        // Remove all careers of this uni
        allowedCareers = allowedCareers.filter((slug: string) => !uniCareerSlugs.includes(slug));
      }
    }
  } else if (careerSlug === "general") {
    if (action === "add") {
      allowedCareers = allCareers.map((c: any) => c.slug);
      allowedUnis = allUniversities.map((u: any) => u.slug);
    } else {
      allowedCareers = [];
      allowedUnis = [];
    }
  } else if (careerSlug) {
    // Handle Single Career Toggle
    if (action === "add") {
      if (!allowedCareers.includes(careerSlug)) allowedCareers.push(careerSlug);
      
      // Check if all careers of the parent uni are now allowed, if so, add the uni to allowedUnis
      const career = allCareers.find((c: any) => c.slug === careerSlug);
      if (career?.university?.slug) {
        const uni = allUniversities.find((u: any) => u.slug === career.university.slug);
        if (uni && uni.careers.every((c: any) => allowedCareers.includes(c.slug))) {
          if (!allowedUnis.includes(uni.slug)) allowedUnis.push(uni.slug);
        }
      }
    } else {
      allowedCareers = allowedCareers.filter((c: string) => c !== careerSlug);
      // If a career is removed, its parent uni must also be removed from allowedUnis
      const career = allCareers.find((c: any) => c.slug === careerSlug);
      if (career?.university?.slug) {
        allowedUnis = allowedUnis.filter((u: string) => u !== career.university.slug);
      }
    }
  }

  const userUpdateData: any = {
    allowedCareers: allowedCareers.length > 0 ? allowedCareers.join(",") : null,
    allowedUniversities: allowedUnis.length > 0 ? allowedUnis.join(",") : null,
  };

  const isSubActive =
    user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
  if (action === "add" && !isSubActive) {
    userUpdateData.subscriptionExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );
  }

  await prisma.user.update({
    where: { id },
    data: userUpdateData,
  });
  redirect("/admin/users");
}

export default async function UsersPage() {
  await requireAdmin();
  
  let users: any[] = [], universities: any[] = [];
  let hasError = false;
  try {
    [users, universities] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          subscriptionExpiry: true,
          isSuspended: true,
          createdAt: true,
          allowedCareers: true,
          allowedUniversities: true,
          _count: { select: { paymentRequests: true } },
        },
      }),
      prisma.university.findMany({ 
        orderBy: { name: "asc" },
        include: {
          careers: { orderBy: { name: "asc" } }
        }
      }),
    ]);
  } catch (error) {
    console.error("AdminUsers Error:", error);
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
          No pudimos conectar con la base de datos para cargar los usuarios.
        </p>
        <Link href="/admin/users" className="btn btn-primary">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="solid-card empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No hay usuarios</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Accesos (Carreras)</th>
                <th>Suscripción</th>
                <th>Pagos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isActive =
                  u.subscriptionExpiry &&
                  new Date(u.subscriptionExpiry) > new Date();
                const allowedList = u.allowedCareers
                  ? u.allowedCareers.split(",")
                  : [];

                return (
                  <tr key={u.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {u.image ? (
                          <Image
                            src={u.image}
                            alt=""
                            width={32}
                            height={32}
                            style={{ borderRadius: "var(--radius-full)" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "var(--radius-full)",
                              background: "var(--glass-bg)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                            }}
                          >
                            {(u.name || u.email || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontWeight: "600",
                              color: "var(--text-primary)",
                            }}
                          >
                            {u.name || "Sin nombre"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "ADMIN" ? "badge-primary" : "badge-success"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === "ADMIN" ? (
                        "Todas (Admin)"
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            minWidth: "180px"
                          }}
                        >
                          {/* General Access Toggle */}
                          {(() => {
                            const allCareerSlugs = universities.flatMap((uni: any) => uni.careers.map((c: any) => c.slug));
                            const allowedList = u.allowedCareers ? u.allowedCareers.split(",") : [];
                            const hasFullAccess = allCareerSlugs.length > 0 && allCareerSlugs.every((slug: string) => allowedList.includes(slug));

                            return (
                              <form action={updateAccess}>
                                <input type="hidden" name="id" value={u.id} />
                                <input type="hidden" name="careerSlug" value="general" />
                                <input type="hidden" name="action" value={hasFullAccess ? "remove" : "add"} />
                                <button
                                  type="submit"
                                  style={{
                                    background: hasFullAccess ? "rgba(16,185,129,0.15)" : "var(--glass-bg)",
                                    border: "1px solid " + (hasFullAccess ? "rgba(16,185,129,0.3)" : "var(--border-default)"),
                                    borderRadius: "var(--radius-sm)",
                                    color: hasFullAccess ? "var(--success-400)" : "var(--text-primary)",
                                    fontSize: "0.65rem",
                                    fontWeight: "800",
                                    cursor: "pointer",
                                    padding: "0.375rem 0.5rem",
                                    width: "100%",
                                    textAlign: "center",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em"
                                  }}
                                >
                                  {hasFullAccess ? "✨ ACCESO TOTAL" : "🔓 DAR ACCESO TOTAL"}
                                </button>
                              </form>
                            );
                          })()}

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {universities.map((uni: any) => {
                              const allowedUnis = u.allowedUniversities ? u.allowedUniversities.split(",") : [];
                              const hasUniAccess = allowedUnis.includes(uni.slug);
                              const allowedCareersList = u.allowedCareers ? u.allowedCareers.split(",") : [];

                              return (
                                <div key={uni.id} style={{ 
                                  padding: "0.5rem", 
                                  background: "rgba(255,255,255,0.02)", 
                                  borderRadius: "var(--radius-md)",
                                  border: "1px solid var(--border-default)"
                                }}>
                                  {/* University Toggle */}
                                  <form action={updateAccess} style={{ marginBottom: "0.375rem" }}>
                                    <input type="hidden" name="id" value={u.id} />
                                    <input type="hidden" name="universitySlug" value={uni.slug} />
                                    <input type="hidden" name="action" value={hasUniAccess ? "remove" : "add"} />
                                    <button
                                      type="submit"
                                      style={{
                                        background: hasUniAccess ? "rgba(34,211,238,0.1)" : "none",
                                        border: hasUniAccess ? "1px solid rgba(34,211,238,0.2)" : "1px solid transparent",
                                        borderRadius: "4px",
                                        color: hasUniAccess ? "var(--accent-400)" : "var(--text-secondary)",
                                        fontSize: "0.7rem",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        padding: "0.125rem 0.375rem",
                                        width: "100%",
                                        textAlign: "left",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.25rem"
                                      }}
                                    >
                                      {hasUniAccess ? "🏛️" : "🏢"} {uni.name} {hasUniAccess ? "✅" : ""}
                                    </button>
                                  </form>

                                  {/* Careers of this University */}
                                  <div style={{ paddingLeft: "0.5rem", display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                                    {uni.careers.map((c: any) => {
                                      const hasCareerAccess = allowedCareersList.includes(c.slug);
                                      return (
                                        <form action={updateAccess} key={c.id}>
                                          <input type="hidden" name="id" value={u.id} />
                                          <input type="hidden" name="careerSlug" value={c.slug} />
                                          <input type="hidden" name="action" value={hasCareerAccess ? "remove" : "add"} />
                                          <button
                                            type="submit"
                                            style={{
                                              background: "none",
                                              border: "none",
                                              cursor: "pointer",
                                              color: hasCareerAccess ? "var(--success-400)" : "var(--text-tertiary)",
                                              fontSize: "0.6875rem",
                                              textAlign: "left",
                                              padding: "0.125rem 0",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "0.375rem"
                                            }}
                                          >
                                            <span style={{ opacity: hasCareerAccess ? 1 : 0.4 }}>
                                              {hasCareerAccess ? "🟢" : "⭕"}
                                            </span>
                                            {c.name}
                                          </button>
                                        </form>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {u.role === "ADMIN" ? (
                        "—"
                      ) : isActive ? (
                        <div>
                          <span className="badge badge-success">Activa</span>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-tertiary)",
                              marginTop: "0.125rem",
                            }}
                          >
                            hasta {formatDate(u.subscriptionExpiry!)}
                          </div>
                        </div>
                      ) : (
                        <span className="badge badge-danger">Inactiva</span>
                      )}
                    </td>
                    <td>{u._count.paymentRequests}</td>
                    <td>
                      <div
                        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                      >
                        <form action={toggleSubscription}>
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(isActive)}
                          />
                          <button
                            type="submit"
                            className={`btn btn-sm ${
                              isActive ? "btn-secondary" : "btn-primary"
                            }`}
                            style={
                              isActive
                                ? { fontSize: "0.75rem" }
                                : {
                                    background: "var(--success-400)",
                                    borderColor: "var(--success-400)",
                                    fontSize: "0.75rem",
                                  }
                            }
                          >
                            {isActive ? "Desactivar" : "Activar"} Suscripción
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
