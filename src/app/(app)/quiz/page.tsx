import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import QuizAgreement from "@/components/quiz/QuizAgreement";
import ClientStats from "@/app/(app)/dashboard/ClientStats";
import GlobalSearch from "@/components/ui/GlobalSearch";
import CareerSelector from "@/components/quiz/CareerSelector";
import { userService } from "@/lib/services/UserService";
import { dashboardService } from "@/lib/services/DashboardService";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = { title: "Cuestionarios" };
export const dynamic = "force-dynamic";

export default async function QuizSelectorPage({
  searchParams,
}: {
  searchParams: Promise<{ career?: string }>;
}) {
  const params = await searchParams;
  const selectedCareerSlug = params.career;

  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/quiz");

  let user: any = null;
  let careers: any[] = [];
  let noAccess: boolean = false;
  let allCategories: any[] = [];
  let progressMap: Record<string, number> = {};
  let hasError = false;
  try {
    user = await userService.getUserProfile(session.user.id);
    if (!user) redirect("/auth/login?error=user_not_found");

    const isSubActive =
      user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
    const isAdmin = user.role === "ADMIN";

    let rawCareers = await prisma.career.findMany({
      orderBy: { name: "asc" },
      include: {
        categories: {
          orderBy: { name: "asc" },
          include: {
            _count: { select: { questions: true } },
          },
        },
      },
    });

    if (!isAdmin) {
      if (!user.allowedCareers || user.allowedCareers.trim() === "") {
        careers = [];
      } else {
        const allowed = user.allowedCareers.split(",").filter(Boolean);
        careers = rawCareers.filter((c) => allowed.includes(c.slug));
      }
    } else {
      careers = rawCareers;
    }

    noAccess =
      !isAdmin &&
      (!isSubActive ||
        !user.allowedCareers ||
        user.allowedCareers.trim() === "");

    const visibleCareerSlugs = careers.map((career: any) => career.slug);

    const stats = await dashboardService.getDashboardStats(
      session.user.id,
      visibleCareerSlugs,
      isAdmin
    );
    allCategories = stats.categories;
    progressMap = stats.progressMap;
  } catch (error) {
    console.error("QuizSelectorPage Error:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "2rem auto",
          padding: "2rem",
          textAlign: "center",
        }}
        className="solid-card"
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h2
          style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}
        >
          Error de Conexión
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          No pudimos cargar los cuestionarios. Por favor, verifica tu conexión a
          internet o intenta más tarde.
        </p>
        <Link href="/quiz" className="btn btn-primary">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <div
      className="quiz-selector-page"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1.25rem" }}
    >
      <QuizAgreement />
      <header style={{ marginBottom: "2rem", width: "100%" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <h1
            className="page-title"
            style={{
              fontSize: "clamp(1.75rem, 6vw, 2.25rem)",
              margin: 0,
              textAlign: "left",
              lineHeight: 1.1,
            }}
          >
            Hola, {user.name?.trim().split(/\s+/)[0] || "Estudiante"} 👋
          </h1>
          <p
            className="page-subtitle"
            style={{
              fontSize: "0.9375rem",
              margin: "0.375rem 0 0 0",
              textAlign: "left",
              opacity: 0.7,
            }}
          >
            Panel de estudio interactivo
          </p>
        </div>

        <div
          className="quiz-header-actions"
          style={{
            display: "flex",
            gap: "0.625rem",
            flexWrap: "wrap",
            padding: "0.25rem 0 0.75rem 0",
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `.quiz-header-actions::-webkit-scrollbar { display: none; }`,
            }}
          />
          {[
            { href: "/quiz/repaso", icon: "🧠", label: "Repaso" },
            { href: "/badges", icon: "🏅", label: "Logros" },
            { href: "/leaderboard", icon: "🏆", label: "Ranking" },
            { href: "/dashboard", icon: "🏠", label: "Inicio" },
            { href: "/settings", icon: "⚙️", label: "Ajustes" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: "var(--radius-full)",
                whiteSpace: "nowrap",
                padding: "0.5rem 1rem",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-default)",
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </header>

      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* @ts-ignore - GlobalSearch migration pending */}
        <GlobalSearch categories={allCategories} />
      </div>

      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          marginTop: "0",
        }}
      >
        ¿Qué quieres estudiar hoy?
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--text-tertiary)",
          marginBottom: "1rem",
        }}
      >
        Elige primero tu carrera y luego revisa tus estadísticas.
      </p>

      {!noAccess && (
        <div id="career-selector" style={{ marginBottom: "2rem" }}>
          {/* @ts-ignore - CareerSelector migration pending */}
          <CareerSelector
            careers={careers}
            selectedCareerSlug={selectedCareerSlug}
          />
        </div>
      )}
      {!noAccess && (
        <ClientStats
          categories={allCategories as any}
          progress={progressMap}
          user={user}
        />
      )}

      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          marginBottom: "1.25rem",
          marginTop: noAccess ? "0" : "1.5rem",
        }}
      >
        Módulos Disponibles
      </h2>

      {noAccess ? (
        <div
          className="solid-card"
          style={{ padding: "2.5rem 2rem", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.6 }}>
            🔒
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Acceso No Habilitado
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              maxWidth: 450,
              margin: "0 auto 1.5rem",
            }}
          >
            Tu cuenta aún no tiene carreras habilitadas. Envía tu comprobante de
            pago y un administrador te asignará las carreras correspondientes.
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
            .filter((c: any) =>
              !selectedCareerSlug ? c.id === careers[0]?.id : c.slug === selectedCareerSlug
            )
            .map((career: any) => (
              <div key={career.id} style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    background: "var(--glass-bg)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--glass-border)",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "12px",
                      background: "var(--gradient-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.75rem",
                      boxShadow: "var(--shadow-glow)",
                    }}
                  >
                    {career.icon || "📚"}
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {career.name}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-tertiary)",
                        fontWeight: "500",
                      }}
                    >
                      {career.categories.length}{" "}
                      {career.categories.length === 1
                        ? "módulo disponible"
                        : "módulos disponibles"}
                    </p>
                  </div>
                </div>

                {career.categories.length === 0 ? (
                  <div
                    className="solid-card"
                    style={{
                      padding: "4rem 2rem",
                      textAlign: "center",
                      background: "var(--bg-secondary)",
                      borderStyle: "dashed",
                      borderRadius: "var(--radius-xl)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3.5rem",
                        marginBottom: "1rem",
                        filter: "grayscale(1) opacity(0.5)",
                      }}
                    >
                      🛠️
                    </div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "700",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Banco en Construcción
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--text-tertiary)",
                        maxWidth: "320px",
                        margin: "0 auto",
                      }}
                    >
                      Estamos cargando nuevas preguntas para{" "}
                      <strong>{career.name}</strong>. ¡Vuelve pronto!
                    </p>
                  </div>
                ) : (
                  <div
                    className="quiz-modules-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {career.categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/quiz/${cat.id}`}
                        className="solid-card hover-scale quiz-module-card"
                        style={{
                          padding: "1.5rem",
                          textDecoration: "none",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: "130px",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-lg)",
                          transition: "all 0.3s var(--transition-base)",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              fontSize: "1.125rem",
                              color: "var(--text-primary)",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {cat.name}
                          </div>

                          {/* Mastery Progress */}
                          {progressMap[cat.id] !== undefined && (
                            <div style={{ marginBottom: "0.75rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  color: "var(--text-tertiary)",
                                  marginBottom: "0.25rem",
                                }}
                              >
                                <span>DOMINIO</span>
                                <span>{progressMap[cat.id]}%</span>
                              </div>
                              <div
                                style={{
                                  height: "4px",
                                  background: "var(--bg-secondary)",
                                  borderRadius: "var(--radius-full)",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${progressMap[cat.id]}%`,
                                    background:
                                      progressMap[cat.id] >= 80
                                        ? "var(--success-400)"
                                        : progressMap[cat.id] >= 50
                                        ? "var(--warning-400)"
                                        : "var(--primary-400)",
                                    transition: "width 0.6s ease-out",
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--text-tertiary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <span style={{ fontSize: "1rem" }}>📝</span>{" "}
                              {cat._count.questions} preguntas
                            </span>
                            {cat.theory && (
                              <span
                                style={{
                                  fontSize: "0.6875rem",
                                  background: "rgba(45,212,191,0.1)",
                                  color: "var(--accent-400)",
                                  padding: "0.125rem 0.5rem",
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: "700",
                                  textTransform: "uppercase",
                                }}
                              >
                                Teoría
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            alignSelf: "flex-end",
                            fontSize: "0.875rem",
                            fontWeight: "700",
                            color: "var(--primary-400)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          Empezar{" "}
                          <span style={{ fontSize: "1.125rem" }}>→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <nav
        className="quiz-mobile-bottom-nav"
        aria-label="Navegación rápida móvil"
      >
        <Link href="/dashboard" className="quiz-mobile-bottom-link">
          <span>🏠</span>
          <span>Inicio</span>
        </Link>
        <Link href="/quiz/repaso" className="quiz-mobile-bottom-link">
          <span>🧠</span>
          <span>Repaso</span>
        </Link>
        <Link href="/badges" className="quiz-mobile-bottom-link">
          <span>🏅</span>
          <span>Logros</span>
        </Link>
        <Link href="/settings" className="quiz-mobile-bottom-link">
          <span>⚙️</span>
          <span>Ajustes</span>
        </Link>
      </nav>
    </div>
  );
}
