import Link from "next/link";
import LandingSectionNav from "./landing-section-nav";
import React from "react";
import AnimatedProductPreview from "@/components/landing/AnimatedProductPreview";
import {
  LANDING_STATS_TIMEOUT_MS,
  IS_PREVIEW_MODE,
  previewCareersData,
  features,
  steps,
  faqs,
  Icon,
} from "@/components/landing/LandingConstants";

export const dynamic = "force-dynamic";

const formatNumber = new Intl.NumberFormat("es-EC");

export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      S
    </div>
  );
}

interface PrimaryLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function PrimaryLink({
  href,
  children,
  variant = "primary",
}: PrimaryLinkProps) {
  return (
    <Link href={href} className={`landing-btn landing-btn-${variant}`}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export default async function HomePage() {
  let session: any = null;

  if (!IS_PREVIEW_MODE) {
    try {
      const { auth } = await import("@/auth");
      session = await auth();
    } catch (error) {
      console.error("Auth error on home page:", error);
    }
  }

  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardUrl = isAdmin ? "/admin" : "/dashboard";

  let totalQuestions = IS_PREVIEW_MODE ? 1290 : 0;
  let careersData: any[] = IS_PREVIEW_MODE ? (previewCareersData as any) : [];

  if (!IS_PREVIEW_MODE) {
    try {
      const { default: prisma } = await import("@/lib/prisma");
      const statsPromise = Promise.all([
        prisma.question.count(),
        prisma.career.findMany({
          select: {
            name: true,
            categories: {
              select: {
                _count: {
                  select: { questions: true },
                },
              },
            },
          },
          orderBy: { name: "asc" },
        }),
      ]);

      const [count, careers] = await (Promise.race([
        statsPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Landing stats request timed out")),
            LANDING_STATS_TIMEOUT_MS
          )
        ),
      ]) as Promise<[number, any[]]>);

      totalQuestions = count;
      careersData = careers;
    } catch (error) {
      console.error("Unable to load landing stats", error);
    }
  }

  const statsByCareer = careersData
    .map((career) => {
      const questionCount = career.categories.reduce(
        (acc: number, category: any) => acc + category._count.questions,
        0
      );
      return { name: career.name, questionCount };
    })
    .filter((career) => career.questionCount > 0)
    .sort((a, b) => b.questionCount - a.questionCount);

  const totalFormatted = formatNumber.format(totalQuestions);
  const topCareer = statsByCareer[0];
  const ctaHref = isLoggedIn ? dashboardUrl : "/auth/login";

  return (
    <div className="landing-page">
      {IS_PREVIEW_MODE && (
        <div className="preview-mode-banner">
          Preview local: datos de ejemplo, sin base de datos ni login.
        </div>
      )}

      <header className="landing-shell landing-nav scroll-reveal">
        <Link href="/" className="landing-brand" aria-label="StudyHub inicio">
          <BrandMark />
          <span className="landing-brand-text">StudyHub</span>
        </Link>

        <div className="landing-nav-actions">
          {isLoggedIn ? (
            <>
              <Link href={dashboardUrl} className="landing-link">
                Ir al panel
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/auth");
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="landing-signout">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="landing-link">
                Ingresar
              </Link>
              <PrimaryLink href="/auth/login">Comenzar</PrimaryLink>
            </>
          )}
        </div>
      </header>

      <main>
        <LandingSectionNav />

        <section className="landing-shell hero">
          <div className="scroll-reveal">
            <div className="eyebrow">
              Preparación universitaria más inteligente
            </div>
            <h1>
              Estudia con foco. <span>Llega seguro al examen.</span>
            </h1>
            <p className="hero-copy">
              StudyHub reúne cuestionarios por carrera, explicaciones claras y
              seguimiento de progreso para que cada sesión de estudio tenga una
              dirección real.
            </p>
            <div className="hero-actions">
              <PrimaryLink href={ctaHref}>Empezar a estudiar</PrimaryLink>
              <PrimaryLink href="#preguntas" variant="secondary">
                Ver preguntas frecuentes
              </PrimaryLink>
            </div>
            <div className="hero-trust" aria-label="Indicadores de StudyHub">
              <span>
                <strong>{totalFormatted}</strong>
                preguntas activas
              </span>
              <span>
                <strong>{Math.max(statsByCareer.length, 1)}</strong>
                áreas con contenido
              </span>
              <span>
                <strong>24/7</strong>
                acceso desde cualquier dispositivo
              </span>
            </div>
          </div>

          <div className="scroll-reveal reveal-delay-1">
            <AnimatedProductPreview
              totalFormatted={totalFormatted}
              topCareer={topCareer}
            />
          </div>
        </section>

        <section className="logo-strip scroll-reveal">
          <div className="landing-shell logo-strip-inner">
            <p>
              Creado para estudiantes que necesitan practicar, corregir y
              avanzar.
            </p>
            <div className="school-logos" aria-label="Universidades mencionadas">
              <span>UIDE</span>
              <span>UDLA</span>
              <span>StudyHub</span>
            </div>
          </div>
        </section>

        <section
          id="stats"
          className="landing-shell section scroll-reveal"
          aria-labelledby="stats-title"
        >
          <div className="section-header">
            <div>
              <span className="section-kicker">Contenido en vivo</span>
              <h2 id="stats-title">
                Un banco de preguntas que crece con tu carrera.
              </h2>
            </div>
            <p>
              Las cifras salen directamente de la base de datos, así que la
              portada refleja el contenido disponible ahora mismo.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card-landing stagger-item">
              <strong>{totalFormatted}</strong>
              <span>preguntas disponibles para practicar.</span>
            </div>
            <div className="stat-card-landing stagger-item">
              <strong>{formatNumber.format(statsByCareer.length)}</strong>
              <span>carreras o áreas con preguntas activas.</span>
            </div>
            <div className="stat-card-landing stagger-item">
              <strong>{topCareer ? topCareer.name : "En expansión"}</strong>
              <span>
                {topCareer
                  ? "área con más contenido hoy."
                  : "nuevas áreas listas para cargar contenido."}
              </span>
            </div>
            <div className="stat-card-landing stagger-item">
              <strong>3 pasos</strong>
              <span>elige, practica y refuerza con explicaciones.</span>
            </div>
          </div>

          <div className="careers-grid" style={{ marginTop: "1rem" }}>
            {statsByCareer.length > 0 ? (
              statsByCareer.slice(0, 6).map((career) => (
                <div key={career.name} className="career-card stagger-item">
                  <strong>{career.name}</strong>
                  <span>{formatNumber.format(career.questionCount)}</span>
                </div>
              ))
            ) : (
              <div className="career-card">
                <strong>Banco en construcción</strong>
                <span>Pronto</span>
              </div>
            )}
          </div>
        </section>

        <section
          id="features"
          className="landing-shell section scroll-reveal"
          aria-labelledby="features-title"
        >
          <div className="section-header">
            <div>
              <span className="section-kicker">Ventajas</span>
              <h2 id="features-title">Menos ruido, más práctica útil.</h2>
            </div>
            <p>
              La portada debe prometer lo que el producto realmente hace:
              ayudarte a estudiar mejor con preguntas, contexto y seguimiento.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="feature-card stagger-item"
              >
                <div className="feature-icon">
                  <Icon name={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="steps"
          className="landing-shell section scroll-reveal"
          aria-labelledby="steps-title"
        >
          <div className="section-header">
            <div>
              <span className="section-kicker">Flujo de estudio</span>
              <h2 id="steps-title"> Una rutina simple para llegar preparado.</h2>
            </div>
          </div>

          <div className="steps-grid">
            {steps.map((item) => (
              <article key={item.step} className="step-card stagger-item">
                <span className="step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="pricing"
          className="landing-shell section pricing-layout scroll-reveal"
          aria-labelledby="pricing-title"
        >
          <div className="pricing-copy">
            <span className="section-kicker">Acceso</span>
            <h2 id="pricing-title">Precio claro para estudiar sin fricción.</h2>
            <p>
              StudyHub está pensado como una inversión pequeña frente al costo
              de estudiar sin dirección. Entra, practica y vuelve a las
              preguntas cada vez que lo necesites.
            </p>
          </div>

          <aside className="pricing-card" aria-label="Plan de acceso ilimitado">
            <h3>Acceso ilimitado</h3>
            <div className="price">
              <strong>$10</strong>
              <span>/ mes</span>
            </div>
            <p>Incluye práctica, explicaciones y actualizaciones de contenido.</p>
            <ul>
              <li>Todas las preguntas disponibles</li>
              <li>Justificación de respuestas</li>
              <li>Activación manual con comprobante</li>
            </ul>
            <PrimaryLink href={ctaHref}>Suscribirme</PrimaryLink>
          </aside>
        </section>

        <section
          id="preguntas"
          className="landing-shell section scroll-reveal"
          aria-labelledby="faq-title"
        >
          <div className="section-header">
            <div>
              <span className="section-kicker">Dudas comunes</span>
              <h2 id="faq-title">Preguntas frecuentes.</h2>
            </div>
          </div>

          <div className="faq-grid">
            {faqs.map((faq) => (
              <article key={faq.q} className="faq-card stagger-item">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta scroll-reveal">
          <div className="landing-shell">
            <h2>Tu siguiente sesión de estudio puede tener más intención.</h2>
            <p>
              Entra a StudyHub, elige tu carrera y convierte cada pregunta en
              una pista clara para mejorar antes del examen.
            </p>
            <PrimaryLink href={ctaHref}>Entrar a StudyHub</PrimaryLink>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell">
          <span>
            © {new Date().getFullYear()} StudyHub. Construido para estudiantes.
          </span>
          <span>Práctica, explicación y progreso en un solo lugar.</span>
        </div>
      </footer>
    </div>
  );
}
