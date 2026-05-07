import Link from "next/link";
import LandingSectionNav from "./landing-section-nav";
import React from "react";
import AnimatedProductPreview from "@/components/landing/AnimatedProductPreview";
import { Reveal, ParallaxBg } from "@/components/landing/LandingAnimations";
import { MassivelyHero } from "@/components/landing/MassivelyHero";
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
    <div className="brand-mark" aria-hidden="true" style={{ width: '32px', height: '32px', fontSize: '14px', lineHeight: '32px' }}>
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
      {/* ── Fixed Parallax Background ── */}
      <ParallaxBg imageUrl="/images/hero-bg.png" />

      {/* ── Interactive Hero with Scroll Transition ── */}
      <MassivelyHero 
        isLoggedIn={isLoggedIn} 
        dashboardUrl={dashboardUrl} 
        brandMark={<BrandMark />} 
      />

      {/* ── Main Content Container ── */}
      <main className="massively-main">
        <div className="glow-border-top" />
        <LandingSectionNav />

        {/* ── About Section ── */}
        <section className="massively-section">
          <Reveal>
            <span className="section-kicker">Misión Académica</span>
            <h2 style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '2.5rem' }}>
              Estudia con propósito. <br />
              <span className="shimmer-text" style={{ color: 'var(--primary-400)' }}>Domina el examen.</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '3.5rem' }}>
              <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
                StudyHub reúne cuestionarios por carrera, explicaciones claras y seguimiento de progreso para que cada sesión de estudio tenga una dirección real.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'flex-start', alignSelf: 'center' }}>
                <PrimaryLink href={ctaHref} className="animate-pulse-glow">Comenzar ahora</PrimaryLink>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Stats Section ── */}
        <section id="stats" className="massively-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <Reveal delay={0.3}>
            <span className="section-kicker">Contenido en Tiempo Real</span>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
              <div className="stat-card-landing" style={{ background: 'transparent', border: 'none', textAlign: 'center' }}>
                <strong style={{ fontSize: '4.5rem', fontWeight: 900 }} className="shimmer-text">{totalFormatted}</strong>
                <span style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginTop: '0.5rem' }}>Preguntas Activas</span>
              </div>
              <div className="stat-card-landing" style={{ background: 'transparent', border: 'none', textAlign: 'center' }}>
                <strong style={{ fontSize: '4.5rem', fontWeight: 900 }}>{formatNumber.format(statsByCareer.length)}</strong>
                <span style={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', marginTop: '0.5rem' }}>Áreas de Contenido</span>
              </div>
            </div>
            
            <div className="careers-grid" style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {statsByCareer.slice(0, 8).map((career, i) => (
                <Reveal key={career.name} delay={0.1 * i}>
                  <div className="career-card magnetic-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', height: '100%' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'white', display: 'block', marginBottom: '0.5rem' }}>{career.name}</strong>
                    <span style={{ opacity: 0.5, fontSize: '0.9rem' }}>{formatNumber.format(career.questionCount)} reactivos</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
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
          <Reveal>
            <span className="section-kicker">Ventajas Tecnológicas</span>
            <h2 style={{ marginBottom: '5rem' }}>Ingeniería aplicada al aprendizaje</h2>
            <div className="features-grid" style={{ gap: '4rem' }}>
              {features.map((feature, i) => (
                <Reveal key={feature.title} delay={0.1 * i}>
                  <article className="feature-card magnetic-card" style={{ border: 'none', background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '16px' }}>
                    <div className="feature-icon" style={{ width: '48px', height: '48px', marginBottom: '2rem', color: 'var(--primary-400)' }}>
                      <Icon name={feature.icon} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', color: 'white' }}>{feature.title}</h3>
                    <p style={{ opacity: 0.6, fontSize: '1rem', lineHeight: '1.6' }}>{feature.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="massively-section" style={{ background: 'linear-gradient(180deg, var(--primary-900) 0%, #000 100%)' }}>
          <Reveal>
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <span className="section-kicker" style={{ color: 'var(--primary-300)' }}>Membresía Elite</span>
              <h2 style={{ color: 'white', fontSize: '3.5rem', marginBottom: '2rem' }}>Libera todo tu potencial</h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '4rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontSize: '5rem', fontWeight: 900, marginBottom: '1rem', color: 'white' }}>$10 <span style={{ fontSize: '1.5rem', fontWeight: 400, opacity: 0.5 }}>/ mes</span></div>
                <p style={{ marginBottom: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                  Acceso ilimitado a simuladores, explicaciones Premium y analíticas avanzadas.
                </p>
                <PrimaryLink href={ctaHref} style={{ background: 'white', color: 'var(--primary-900)', border: 'none', padding: '1.25rem 3rem', fontSize: '1.1rem' }}>
                  Activar Acceso Total
                </PrimaryLink>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Footer ── */}
        <footer className="massively-footer" style={{ borderTop: 'none', background: 'black' }}>
          <Reveal>
            <div style={{ marginBottom: '4rem' }}>
              <BrandMark />
              <h3 style={{ marginTop: '1.5rem', letterSpacing: '0.3em', fontWeight: 900, color: 'white' }}>STUDYHUB</h3>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
              <Link href="/auth/login" style={{ opacity: 0.6 }} className="landing-link">Ingresar</Link>
              <Link href="#stats" style={{ opacity: 0.6 }} className="landing-link">Contenido</Link>
              <Link href="#pricing" style={{ opacity: 0.6 }} className="landing-link">Planes</Link>
            </div>
            <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>© {new Date().getFullYear()} StudyHub Engineering. Calidad académica superior.</p>
          </Reveal>
        </footer>
      </main>
    </div>
  );
}
