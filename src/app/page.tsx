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

// Local BrandMark component to fix missing export
const BrandMark = () => (
  <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-cyan-500 rounded-lg shadow-lg" />
);

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session;
  const dashboardUrl = "/dashboard";

  // Fixed Prisma Query
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
      <ParallaxBg imageUrl="/images/hero-bg.png" />

      {/* ── Cinematic Hero ── */}
      <MassivelyHero 
        isLoggedIn={isLoggedIn} 
        dashboardUrl={dashboardUrl} 
        brandMark={<BrandMark />} 
      />

      {/* ── Main Content Body ── */}
      <main className="massively-main">
        {/* Stats Section */}
        <section id="stats" className="massively-section">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <span className="text-emerald-500 font-bold uppercase tracking-widest text-[11px] mb-4 block">
              Resultados Reales
            </span>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Domina <span className="text-emerald-400">{totalQuestions.toLocaleString()}</span> Preguntas Clave
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Todo el contenido que necesitas para tu examen, organizado por carrera y nivel de dificultad.
            </p>
          </div>

          <AnimatedProductPreview totalFormatted={totalFormatted} topCareer={topCareer} />
        </section>

        {/* Features Section */}
        <section id="features" className="massively-section bg-white/[0.01]">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="magnetic-card">
              <Zap className="text-emerald-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4 text-white">Aprendizaje Ágil</h3>
              <p className="text-white/40 leading-relaxed">
                Algoritmos inteligentes que se adaptan a tu ritmo de estudio para maximizar la retención.
              </p>
            </div>
            <div className="magnetic-card">
              <ShieldCheck className="text-cyan-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4 text-white">Cero Distracciones</h3>
              <p className="text-white/40 leading-relaxed">
                Interfaz minimalista diseñada para que el 100% de tu atención esté en aprender.
              </p>
            </div>
            <div className="magnetic-card">
              <Sparkles className="text-violet-400 mb-6" size={40} />
              <h3 className="text-2xl font-bold mb-4 text-white">IA Integrada</h3>
              <p className="text-white/40 leading-relaxed">
                Explicaciones generadas por IA para cada pregunta que no logres entender a la primera.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section Placeholder */}
        <section id="pricing" className="massively-section text-center">
          <div className="py-20 bg-emerald-500/5 rounded-[40px] border border-emerald-500/10">
            <h2 className="text-4xl font-black mb-4">Elige tu Plan de Éxito</h2>
            <p className="text-white/50 mb-10">Acceso total por menos de lo que imaginas.</p>
            <Link 
              href="/pricing"
              className="px-10 py-4 rounded-full bg-emerald-500 text-black font-black hover:scale-105 transition-transform"
            >
              Ver Planes de Estudio
            </Link>
          </div>
        </section>

        {/* FAQ Section Placeholder */}
        <section id="preguntas" className="massively-section">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="font-bold mb-2">¿Cómo funciona el modo práctica?</p>
                  <p className="text-white/40 text-sm italic">Seleccionas tu carrera y empiezas a responder preguntas reales de exámenes pasados.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-white/20 text-[11px] uppercase tracking-widest">
        &copy; {new Date().getFullYear()} StudyHub — Elevando el Estándar Académico
      </footer>
    </div>
  );
}
