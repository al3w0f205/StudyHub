import { MassivelyHero } from "@/components/landing/MassivelyHero";
import AnimatedProductPreview from "@/components/landing/AnimatedProductPreview";
import { 
  CheckCircle2, 
  BrainCircuit, 
  Target, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function ParallaxBg({ imageUrl }: { imageUrl: string }) {
  return (
    <div 
      className="fixed inset-0 z-[-1] opacity-30 grayscale pointer-events-none"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    />
  );
}

const BrandMark = () => (
  <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-lg shadow-lg" />
);

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session;
  const dashboardUrl = "/dashboard";

  const totalQuestions = await prisma.question.count();
  const careers = await prisma.career.findMany({
    include: {
      _count: true
    }
  });

  const statsByCareer = careers
    .map(c => ({ 
      name: c.name, 
      questionCount: (c as any)._count?.questions || 0 
    }))
    .filter(c => c.questionCount > 0)
    .sort((a, b) => b.questionCount - a.questionCount);

  const totalFormatted = totalQuestions.toLocaleString();
  const topCareer = statsByCareer[0] || { name: "General", questionCount: 0 };

  return (
    <div className="massively-layout">
      {/* ── Fixed Background Elements ── */}
      <div className="aurora-container">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
      </div>

      {/* ── Cinematic Hero ── */}
      <MassivelyHero 
        isLoggedIn={isLoggedIn} 
        dashboardUrl={dashboardUrl} 
      />

      {/* ── Main Content Body ── */}
      <main className="massively-main">
        
        {/* Stats Section */}
        <section id="stats" className="massively-section pt-40">
          <div className="max-w-5xl mx-auto text-center mb-32 px-8">
            <span className="text-cyan-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">
              Contenido Verificado
            </span>
            <h2 className="text-5xl md:text-8xl font-black mb-10 text-white leading-[1.1] tracking-tighter">
              Domina <span className="text-cyan-400">{totalQuestions.toLocaleString()}</span> Preguntas Clave
            </h2>
            <p className="text-white/40 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Accede a bancos de preguntas seleccionados quirúrgicamente para asegurar tu ingreso a la universidad.
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-8">
            <AnimatedProductPreview totalFormatted={totalFormatted} topCareer={topCareer} />
          </div>
        </section>

        {/* Features Grid */}
        <section id="ventajas" className="massively-section bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ventajas Exclusivas</h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
              {[
                {
                  title: "Simulacros Reales",
                  desc: "Exámenes diseñados con la misma estructura y dificultad que el examen oficial de ingreso.",
                  icon: <Target className="text-cyan-400" size={48} />
                },
                {
                  title: "Análisis de Progreso",
                  desc: "Visualiza tus fortalezas y debilidades con gráficas detalladas de tu rendimiento por área.",
                  icon: <BrainCircuit className="text-blue-400" size={48} />
                },
                {
                  title: "Banco de Preguntas",
                  desc: "Miles de ejercicios actualizados con explicaciones detalladas para cada respuesta.",
                  icon: <Sparkles className="text-cyan-300" size={48} />
                }
              ].map((feature, i) => (
                <div key={i} className="magnetic-card group p-12 md:p-16 flex flex-col items-start gap-8">
                  <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-cyan-500/10 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/40 leading-relaxed text-lg font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planes" className="massively-section relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-8 relative z-10">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">Planes a tu medida</h2>
              <p className="text-white/40 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                Elige el plan que mejor se adapte a tu ritmo de estudio y asegura tu ingreso hoy mismo.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Plan Mensual */}
              <div className="magnetic-card border-white/5 bg-white/[0.02] p-12 md:p-20">
                <div className="mb-12">
                  <span className="text-blue-400 text-xs font-black tracking-widest uppercase mb-4 block">Flexibilidad Total</span>
                  <h3 className="text-3xl font-bold text-white mb-4">Acceso Mensual</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-white tracking-tighter">$25</span>
                    <span className="text-white/30 text-lg">/ mes</span>
                  </div>
                </div>
                <ul className="space-y-6 mb-12">
                  {["Banco ilimitado de preguntas", "Simulacros por facultad", "Soporte 24/7 vía Chat"].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-white/60 text-lg font-medium">
                      <CheckCircle2 className="text-blue-500 shrink-0" size={24} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="w-full py-6 rounded-3xl bg-white/5 hover:bg-white/10 text-white font-black transition-all border border-white/10 text-center uppercase tracking-widest text-sm">
                  Empezar Ahora
                </Link>
              </div>

              {/* Plan Semestral */}
              <div className="magnetic-card border-cyan-500/20 bg-cyan-500/[0.03] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[11px] font-black px-6 py-2 rounded-bl-2xl tracking-widest uppercase">
                  RECOMENDADO
                </div>
                <div className="mb-12">
                  <span className="text-cyan-400 text-xs font-black tracking-widest uppercase mb-4 block">Preparación Completa</span>
                  <h3 className="text-3xl font-bold text-white mb-4">Plan Semestral</h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-cyan-400 tracking-tighter">$120</span>
                    <span className="text-white/30 text-lg">/ 6 meses</span>
                  </div>
                </div>
                <ul className="space-y-6 mb-12">
                  {["Todo el contenido incluido", "Asesoría personalizada", "Dashboard de errores", "Acceso Prioritario"].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-white/60 text-lg font-medium">
                      <Sparkles className="text-cyan-400 shrink-0" size={24} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] text-center uppercase tracking-widest text-sm">
                  Obtener Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="preguntas" className="massively-section bg-black/40">
          <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-32">
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">¿Cómo empezar?</h2>
              <div className="w-24 h-1.5 bg-cyan-500 mx-auto rounded-full opacity-50" />
            </div>
            
            <div className="grid gap-10 lg:gap-16">
              {[
                { q: "¿Cómo se activa mi suscripción?", a: "Tras realizar tu transferencia, inicia sesión y sube tu comprobante en la sección de pagos. Nuestro equipo verificará la transacción y activará tu acceso en un máximo de 24 horas." },
                { q: "¿Cuáles son los métodos de pago?", a: "Aceptamos transferencias bancarias y depósitos locales. Los datos bancarios se proporcionan una vez que inicias sesión y seleccionas el acceso Premium." },
                { q: "¿Puedo estudiar en varios dispositivos?", a: "Sí, tu cuenta es personal y puedes acceder desde tu PC, tablet o móvil para estudiar en cualquier lugar." },
                { q: "¿Ofrecen devoluciones?", a: "Debido a que el acceso es inmediato y digital, no ofrecemos devoluciones, pero garantizamos que el contenido es el más actualizado del mercado." }
              ].map((faq, i) => (
                <div key={i} className="group p-12 md:p-20 rounded-[4rem] bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all duration-700 hover:bg-white/[0.05]">
                  <h4 className="text-2xl md:text-3xl font-bold mb-8 text-cyan-400/90 group-hover:text-cyan-400 transition-colors leading-tight">
                    {faq.q}
                  </h4>
                  <p className="text-white/50 leading-relaxed font-medium text-lg md:text-xl">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-32 border-t border-white/5 bg-black/60">
        <div className="flex flex-col items-center gap-12 max-w-5xl mx-auto px-8">
          <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="w-10 h-10 bg-blue-600 rounded-xl rotate-12 shadow-lg shadow-blue-600/20" />
            <span className="text-2xl font-black tracking-tighter text-white">STUDYHUB</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 text-[12px] font-bold uppercase tracking-[0.4em] text-white/30">
            <Link href="/terms" className="hover:text-cyan-400 transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacidad</Link>
            <Link href="/support" className="hover:text-cyan-400 transition-colors">Soporte</Link>
          </div>
          <p className="text-white/10 text-[10px] font-medium uppercase tracking-[1em] leading-loose text-center mt-8">
            &copy; {new Date().getFullYear()} StudyHub — Elevando tu potencial académico
          </p>
        </div>
      </footer>
    </div>
  );
}
