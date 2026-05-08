import { MassivelyHero } from "@/components/landing/MassivelyHero";
import AnimatedProductPreview from "@/components/landing/AnimatedProductPreview";
import {
  BrainCircuit,
  CheckCircle2,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function LandingPage() {
  const isPreviewMode = process.env.STUDYHUB_PREVIEW_MODE === "true";
  const session = isPreviewMode ? null : await auth();
  const isLoggedIn = !!session;
  const dashboardUrl = "/dashboard";

  let totalQuestions = 0;
  let statsByCareer: { name: string; questionCount: number }[] = [];

  if (isPreviewMode) {
    totalQuestions = 12500;
    statsByCareer = [
      { name: "Medicina", questionCount: 4500 },
      { name: "Ingeniería", questionCount: 3200 },
      { name: "Derecho", questionCount: 2800 },
    ];
  } else {
    try {
      totalQuestions = await prisma.question.count();
      const careers = await prisma.career.findMany({
        include: {
          _count: true,
        },
      });
      statsByCareer = careers
        .map((career) => ({
          name: career.name,
          questionCount: (career as any)._count?.questions || 0,
        }))
        .filter((career) => career.questionCount > 0)
        .sort((a, b) => b.questionCount - a.questionCount);
    } catch (e) {
      console.error("Failed to fetch landing stats:", e);
    }
  }

  const totalFormatted = totalQuestions.toLocaleString();
  const topCareer = statsByCareer[0] || { name: "General", questionCount: 0 };

  return (
    <div className="massively-layout">
      {isPreviewMode && (
        <div className="preview-mode-banner">
          Modo Preview Activo - Sin conexión a Base de Datos
        </div>
      )}

      <div className="aurora-container">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
      </div>

      <MassivelyHero isLoggedIn={isLoggedIn} dashboardUrl={dashboardUrl} />

      <main className="massively-main">
        <section id="stats" className="massively-section massively-section-first">
          <div className="landing-container text-center mb-16 md:mb-24">
            <span className="text-cyan-500 font-bold uppercase tracking-[0.32em] text-[10px] mb-5 block">
              Contenido Verificado
            </span>
            <h2 className="landing-section-title">
              Domina{" "}
              <span className="text-cyan-400">
                {totalQuestions.toLocaleString()}
              </span>{" "}
              Preguntas Clave
            </h2>
            <p className="landing-section-copy">
              Accede a bancos de preguntas seleccionados quirúrgicamente para
              asegurar tu ingreso a la universidad.
            </p>
          </div>

          <div className="landing-container">
            <AnimatedProductPreview
              totalFormatted={totalFormatted}
              topCareer={topCareer}
            />
          </div>
        </section>

        <section id="ventajas" className="massively-section bg-white/[0.01]">
          <div className="landing-container">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="landing-section-title">Ventajas Exclusivas</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: "Simulacros Reales",
                  desc: "Exámenes diseñados con la misma estructura y dificultad que el examen oficial de ingreso.",
                  icon: <Target className="text-cyan-400" size={48} />,
                },
                {
                  title: "Análisis de Progreso",
                  desc: "Visualiza tus fortalezas y debilidades con gráficas detalladas de tu rendimiento por área.",
                  icon: <BrainCircuit className="text-blue-400" size={48} />,
                },
                {
                  title: "Banco de Preguntas",
                  desc: "Miles de ejercicios actualizados con explicaciones detalladas para cada respuesta.",
                  icon: <Sparkles className="text-cyan-300" size={48} />,
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="magnetic-card group flex flex-col items-start gap-6"
                >
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-cyan-500/10 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/45 leading-relaxed text-lg font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planes" className="massively-section relative">
          <div className="landing-container relative z-10">
            <div className="text-center mb-24 md:mb-32">
              <h2 className="landing-section-title">Planes a tu medida</h2>
              <p className="landing-section-copy">
                Elige el plan que mejor se adapte a tu ritmo de estudio y
                asegura tu ingreso hoy mismo.
              </p>
            </div>

            <div className="flex justify-center mt-16 md:mt-24">
              <article className="plan-card plan-card-featured max-w-lg w-full">
                <div className="plan-badge">RECOMENDADO</div>
                <div className="plan-card-head">
                  <span className="plan-kicker">PREPARACIÓN COMPLETA</span>
                  <h3 className="plan-title">Acceso Premium</h3>
                  <div className="plan-price-row">
                    <span className="plan-price plan-price-accent">$10</span>
                    <span className="plan-period">/ mes</span>
                  </div>
                </div>
                <ul className="plan-list plan-list-accent">
                  {[
                    "Banco ilimitado de preguntas",
                    "Simulacros por facultad",
                    "Asesoría personalizada",
                    "Dashboard de errores",
                    "Acceso Prioritario",
                  ].map((item) => (
                    <li key={item}>
                      <Sparkles aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className="plan-button plan-button-primary"
                >
                  Obtener Premium
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section id="preguntas" className="massively-section bg-black/40">
          <div className="landing-container">
            <div className="text-center mb-14 md:mb-20">
              <h2 className="landing-section-title">¿Cómo empezar?</h2>
              <div className="w-24 h-1.5 bg-cyan-500 mx-auto rounded-full opacity-50" />
            </div>

            <div className="grid gap-6 lg:gap-8">
              {[
                {
                  q: "¿Cómo se activa mi suscripción?",
                  a: "Tras realizar tu transferencia, inicia sesión y sube tu comprobante en la sección de pagos. Nuestro equipo verificará la transacción y activará tu acceso en un máximo de 24 horas.",
                },
                {
                  q: "¿Cuáles son los métodos de pago?",
                  a: "Aceptamos transferencias bancarias y depósitos locales. Los datos bancarios se proporcionan una vez que inicias sesión y seleccionas el acceso Premium.",
                },
                {
                  q: "¿Puedo estudiar en varios dispositivos?",
                  a: "Sí, tu cuenta es personal y puedes acceder desde tu PC, tablet o móvil para estudiar en cualquier lugar.",
                },
                {
                  q: "¿Ofrecen devoluciones?",
                  a: "Debido a que el acceso es inmediato y digital, no ofrecemos devoluciones, pero garantizamos que el contenido es el más actualizado del mercado.",
                },
              ].map((faq) => (
                <div
                  key={faq.q}
                  className="faq-card group"
                >
                  <h4 className="faq-card-title">
                    {faq.q}
                  </h4>
                  <p className="faq-card-copy">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-24 border-t border-white/5 bg-black/60">
        <div className="landing-container flex flex-col items-center justify-center gap-10">
          <div className="flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 w-full">
            <div className="w-10 h-10 bg-blue-600 rounded-xl rotate-12 shadow-lg shadow-blue-600/20 flex items-center justify-center text-white font-black text-xl">
              S
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              STUDYHUB
            </span>
          </div>
          <div className="w-full flex flex-wrap items-center justify-center gap-8 md:gap-12 text-[12px] font-bold uppercase tracking-[0.32em] text-white/50">
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">
              Términos
            </Link>
            <Link
              href="/privacy"
              className="hover:text-cyan-400 transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/support"
              className="hover:text-cyan-400 transition-colors"
            >
              Soporte
            </Link>
          </div>
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-[0.3em] leading-loose text-center mt-4">
            &copy; {new Date().getFullYear()} StudyHub - Elevando tu potencial
            académico
          </p>
        </div>
      </footer>
    </div>
  );
}
