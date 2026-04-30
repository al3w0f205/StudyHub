import Link from "next/link";
import LandingSectionNav from "./landing-section-nav";

export const dynamic = "force-dynamic";

const formatNumber = new Intl.NumberFormat("es-EC");
const LANDING_STATS_TIMEOUT_MS = 2500;
const IS_PREVIEW_MODE = process.env.STUDYHUB_PREVIEW_MODE === "true";

const previewCareersData = [
  { name: "Medicina", categories: [{ _count: { questions: 420 } }, { _count: { questions: 280 } }] },
  { name: "Ingeniería", categories: [{ _count: { questions: 260 } }, { _count: { questions: 180 } }] },
  { name: "Derecho", categories: [{ _count: { questions: 150 } }] },
];

const features = [
  {
    icon: "target",
    title: "Simulador de Examen Real",
    description:
      "Entrena con presión de tiempo y modo enfoque para simular la experiencia real del examen universitario.",
  },
  {
    icon: "explain",
    title: "Flashcards Interactivos",
    description:
      "Usa el modo de tarjetas para estudiar conceptos clave con active recall y explicaciones instantáneas.",
  },
  {
    icon: "progress",
    title: "Gamificación y Rachas",
    description:
      "Gana puntos, desbloquea medallas y mantén tu racha diaria para convertir el estudio en un hábito divertido.",
  },
  {
    icon: "mobile",
    title: "PWA: Instálalo en tu Celular",
    description:
      "Accede instantáneamente desde tu pantalla de inicio como una app nativa, incluso sin conexión en algunas áreas.",
  },
];

const steps = [
  {
    step: "01",
    title: "Elige tu ruta",
    description:
      "Selecciona tu carrera y entra directo al contenido que corresponde a tu semestre o materia.",
  },
  {
    step: "02",
    title: "Responde con intención",
    description:
      "Practica preguntas reales, revisa alternativas y entrena con el ritmo que mejor se ajuste a tu día.",
  },
  {
    step: "03",
    title: "Corrige y refuerza",
    description:
      "Usa las explicaciones para convertir errores en memoria útil antes de volver a intentar.",
  },
];

const faqs = [
  {
    q: "¿Cómo se actualizan las preguntas?",
    a: "El banco de preguntas se revisa y amplía continuamente. Si encuentras un error, puedes reportarlo para que el equipo lo corrija.",
  },
  {
    q: "¿Cómo funciona el acceso pagado?",
    a: "El pago se valida de forma manual. Envías tu comprobante y un administrador activa tu cuenta y las carreras solicitadas.",
  },
  {
    q: "¿Puedo estudiar desde el celular?",
    a: "Sí. StudyHub está pensado para funcionar bien en móvil, con sesiones cortas, lectura clara y navegación simple.",
  },
  {
    q: "¿Qué pasa si mi carrera no está disponible?",
    a: "Puedes sugerir nuevas carreras o colaborar con material. La plataforma está preparada para crecer por áreas y categorías.",
  },
];

const Icon = ({ name }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "target") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  }

  if (name === "explain") {
    return (
      <svg {...common}>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
        <path d="M6 21h12a2 2 0 0 0 2-2V7" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 5-7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
};

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      S
    </div>
  );
}

function PrimaryLink({ href, children, variant = "primary" }) {
  return (
    <Link href={href} className={`landing-btn landing-btn-${variant}`}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

import MathText from "@/components/ui/MathText";

function ProductPreview({ totalFormatted, topCareer }) {
  return (
    <div className="product-preview" aria-label="Vista previa de StudyHub">
      <div className="preview-toolbar">
        <div className="preview-brand">
          <BrandMark />
          <span>StudyHub</span>
        </div>
        <span className="preview-pill">Simulacro activo</span>
      </div>

      <div className="preview-grid">
        <aside className="preview-sidebar">
          <span className="preview-label">Estudiante en Racha</span>
          <strong>🔥 5 Días</strong>
          <div className="preview-progress">
            <span style={{ width: "85%", background: "var(--warning-400)" }} />
          </div>
          <small>Nivel 12 — Maestro</small>
        </aside>

        <div className="preview-question">
          <div className="preview-question-topline">
            <span>Modo Simulacro</span>
            <span>00:24 ⏱️</span>
          </div>
          <MathText className="preview-question-text">
            ### ¿Cuál es la derivada de $f(x) = \sin(x)$?
          </MathText>
          <div className="preview-answer selected" style={{ borderColor: "var(--primary-400)", background: "rgba(99,102,241,0.1)" }}>
            <span>A</span>
            <MathText>$\cos(x)$</MathText>
          </div>
          <div className="preview-answer">
            <span>B</span>
            <MathText>$-\cos(x)$</MathText>
          </div>
          <div className="preview-explanation" style={{ borderLeft: "3px solid var(--accent-400)", background: "rgba(34,211,238,0.05)" }}>
            <strong>Justificación</strong>
            <p>
              La derivada de la función seno es el coseno positivo. StudyHub te muestra el paso a paso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let session = null;

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
  let careersData = IS_PREVIEW_MODE ? previewCareersData : [];

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

      [totalQuestions, careersData] = await Promise.race([
        statsPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Landing stats request timed out")),
            LANDING_STATS_TIMEOUT_MS
          )
        ),
      ]);
    } catch (error) {
      console.error("Unable to load landing stats", error);
    }
  }

  const statsByCareer = careersData
    .map((career) => {
      const questionCount = career.categories.reduce(
        (acc, category) => acc + category._count.questions,
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
            <div className="eyebrow">Preparación universitaria más inteligente</div>
            <h1>
              Estudia con foco. <span>Llega seguro al examen.</span>
            </h1>
            <p className="hero-copy">
              StudyHub reúne cuestionarios por carrera, explicaciones claras y seguimiento de progreso para que cada sesión de estudio tenga una dirección real.
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
            <ProductPreview totalFormatted={totalFormatted} topCareer={topCareer} />
          </div>
        </section>

        <section className="logo-strip scroll-reveal">
          <div className="landing-shell logo-strip-inner">
            <p>Creado para estudiantes que necesitan practicar, corregir y avanzar.</p>
            <div className="school-logos" aria-label="Universidades mencionadas">
              <span>UIDE</span>
              <span>UDLA</span>
              <span>StudyHub</span>
            </div>
          </div>
        </section>

        <section id="stats" className="landing-shell section scroll-reveal" aria-labelledby="stats-title">
          <div className="section-header">
            <div>
              <span className="section-kicker">Contenido en vivo</span>
              <h2 id="stats-title">Un banco de preguntas que crece con tu carrera.</h2>
            </div>
            <p>
              Las cifras salen directamente de la base de datos, así que la portada refleja el contenido disponible ahora mismo.
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
              <span>{topCareer ? "área con más contenido hoy." : "nuevas áreas listas para cargar contenido."}</span>
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

        <section id="features" className="landing-shell section scroll-reveal" aria-labelledby="features-title">
          <div className="section-header">
            <div>
              <span className="section-kicker">Ventajas</span>
              <h2 id="features-title">Menos ruido, más práctica útil.</h2>
            </div>
            <p>
              La portada debe prometer lo que el producto realmente hace: ayudarte a estudiar mejor con preguntas, contexto y seguimiento.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card stagger-item">
                <div className="feature-icon">
                  <Icon name={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="steps" className="landing-shell section scroll-reveal" aria-labelledby="steps-title">
          <div className="section-header">
            <div>
              <span className="section-kicker">Flujo de estudio</span>
              <h2 id="steps-title">Una rutina simple para llegar preparado.</h2>
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

        <section id="pricing" className="landing-shell section pricing-layout scroll-reveal" aria-labelledby="pricing-title">
          <div className="pricing-copy">
            <span className="section-kicker">Acceso</span>
            <h2 id="pricing-title">Precio claro para estudiar sin fricción.</h2>
            <p>
              StudyHub está pensado como una inversión pequeña frente al costo de estudiar sin dirección. Entra, practica y vuelve a las preguntas cada vez que lo necesites.
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

        <section id="preguntas" className="landing-shell section scroll-reveal" aria-labelledby="faq-title">
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
              Entra a StudyHub, elige tu carrera y convierte cada pregunta en una pista clara para mejorar antes del examen.
            </p>
            <PrimaryLink href={ctaHref}>Entrar a StudyHub</PrimaryLink>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell">
          <span>© {new Date().getFullYear()} StudyHub. Construido para estudiantes.</span>
          <span>Práctica, explicación y progreso en un solo lugar.</span>
        </div>
      </footer>
    </div>
  );
}
