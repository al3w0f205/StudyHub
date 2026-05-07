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
  className?: string;
  style?: React.CSSProperties;
}

export function PrimaryLink({
  href,
  children,
  variant = "primary",
  className = "",
  style,
}: PrimaryLinkProps) {
  return (
    <Link 
      href={href} 
      className={`landing-btn landing-btn-${variant} ${className}`}
      style={style}
    >
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
    <div className="massively-layout">
      {/* ── Fixed Background ── */}
      <div 
        className="massively-bg" 
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />

      {/* ── Intro Section (Full Height) ── */}
      <section className="massively-intro">
        <header className="landing-shell landing-nav" style={{ position: 'absolute', top: 0, background: 'transparent', border: 'none' }}>
          <Link href="/" className="landing-brand" aria-label="StudyHub inicio">
            <BrandMark />
            <span className="landing-brand-text" style={{ color: 'white' }}>StudyHub</span>
          </Link>
          <div className="landing-nav-actions">
            {isLoggedIn ? (
              <Link href={dashboardUrl} className="landing-btn landing-btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                Ir al panel
              </Link>
            ) : (
              <Link href="/auth/login" className="landing-btn landing-btn-primary">
                Ingresar
              </Link>
            )}
          </div>
        </header>

        <div className="animate-fade-in">
          <p>Preparación Universitaria</p>
          <h1>StudyHub</h1>
          <p>Llega seguro al examen</p>
        </div>
        
        <div style={{ position: 'absolute', bottom: '2rem', animation: 'float 2s infinite' }}>
          <span style={{ fontSize: '2rem', color: 'white' }}>↓</span>
        </div>
      </section>

      {/* ── Main Content Container (Elevated) ── */}
      <main className="massively-main">
        <LandingSectionNav />

        {/* ── Hero Copy / About ── */}
        <section className="massively-section">
          <span className="section-kicker">Nuestra Misión</span>
          <h2 style={{ textAlign: 'left', borderBottom: '1px solid var(--border-default)', paddingBottom: '2rem' }}>
            Estudia con foco. <br />
            <span style={{ color: 'var(--primary-400)' }}>Domina cada pregunta.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '3rem' }}>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.8' }}>
              StudyHub reúne cuestionarios por carrera, explicaciones claras y seguimiento de progreso para que cada sesión de estudio tenga una dirección real. No es solo practicar; es entender por qué cada respuesta es la correcta.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              <PrimaryLink href={ctaHref}>Comenzar ahora</PrimaryLink>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section id="stats" className="massively-section">
          <span className="section-kicker">Contenido en vivo</span>
          <h2>Un banco de datos en tiempo real</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card-landing" style={{ background: 'transparent', border: 'none', textAlign: 'center' }}>
              <strong style={{ fontSize: '3.5rem' }}>{totalFormatted}</strong>
              <span style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Preguntas Activas</span>
            </div>
            <div className="stat-card-landing" style={{ background: 'transparent', border: 'none', textAlign: 'center' }}>
              <strong style={{ fontSize: '3.5rem' }}>{formatNumber.format(statsByCareer.length)}</strong>
              <span style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Carreras Disponibles</span>
            </div>
          </div>
          
          <div className="careers-grid" style={{ marginTop: '4rem' }}>
            {statsByCareer.slice(0, 8).map((career) => (
              <div key={career.name} className="career-card" style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '0' }}>
                <strong style={{ fontSize: '1.1rem' }}>{career.name}</strong>
                <span style={{ opacity: 0.7 }}>{formatNumber.format(career.questionCount)} preguntas</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Product Preview ── */}
        <section className="massively-section" style={{ background: 'var(--bg-secondary)' }}>
          <AnimatedProductPreview
            totalFormatted={totalFormatted}
            topCareer={topCareer}
          />
        </section>

        {/* ── Features ── */}
        <section id="features" className="massively-section">
          <span className="section-kicker">Características</span>
          <h2>Diseñado para el aprendizaje profundo</h2>
          <div className="features-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card" style={{ border: 'none', background: 'transparent', padding: '0' }}>
                <div className="feature-icon" style={{ width: '40px', height: '40px', marginBottom: '1.5rem' }}>
                  <Icon name={feature.icon} />
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{feature.title}</h3>
                <p style={{ opacity: 0.8, fontSize: '0.95rem' }}>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="massively-section" style={{ background: 'var(--primary-900)', color: 'white' }}>
          <span className="section-kicker" style={{ color: 'var(--primary-100)' }}>Acceso Premium</span>
          <h2 style={{ color: 'white' }}>Inversión en tu futuro</h2>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1rem' }}>$10 <span style={{ fontSize: '1.5rem', fontWeight: 400, opacity: 0.7 }}>/ mes</span></div>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem', opacity: 0.9 }}>
              Acceso total a todas las preguntas, explicaciones detalladas y seguimiento de progreso en todas las carreras.
            </p>
            <PrimaryLink href={ctaHref} variant="primary" style={{ background: 'white', color: 'var(--primary-900)', border: 'none' }}>Suscribirme ahora</PrimaryLink>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section id="preguntas" className="massively-section">
          <span className="section-kicker">Soporte</span>
          <h2>Dudas comunes</h2>
          <div className="faq-grid" style={{ gridTemplateColumns: '1fr', gap: '3rem' }}>
            {faqs.slice(0, 4).map((faq) => (
              <article key={faq.q}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderLeft: '4px solid var(--primary-400)', paddingLeft: '1rem' }}>{faq.q}</h3>
                <p style={{ opacity: 0.8, paddingLeft: '1.25rem' }}>{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="massively-footer">
          <div style={{ marginBottom: '2rem' }}>
            <BrandMark />
            <h3 style={{ marginTop: '1rem', letterSpacing: '0.2em' }}>STUDYHUB</h3>
          </div>
          <p>© {new Date().getFullYear()} StudyHub. Todos los derechos reservados.</p>
          <p style={{ marginTop: '0.5rem', opacity: 0.5 }}>Preparación de élite para estudiantes decididos.</p>
        </footer>
      </main>
    </div>
  );
}
