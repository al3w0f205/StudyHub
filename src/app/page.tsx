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

        {/* Pricing Section - Premium Redesign */}
        <section id="pricing" className="massively-section relative overflow-hidden">
          {/* Subtle Glow behind pricing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Suscripción Pro
            </div>
            
            <div className="magnetic-card p-12 md:p-20 border-white/10 bg-white/[0.02]">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Elige tu Plan de Éxito
              </h2>
              <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
                Acceso ilimitado a todas las carreras, simulacros reales y explicaciones con IA. Todo lo que necesitas para tu ingreso.
              </p>
              
              <Link 
                href="#pricing"
                className="group relative inline-flex items-center justify-center px-12 py-5 bg-emerald-500 text-black font-black text-lg rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <span>Ver Planes de Estudio</span>
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section - Clean & Modern */}
        <section id="preguntas" className="massively-section">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Preguntas Frecuentes</h2>
              <div className="w-12 h-1 bg-emerald-500 mx-auto opacity-30" />
            </div>
            
            <div className="space-y-4">
              {[
                { q: "¿Cómo funciona el modo de práctica?", a: "Eliges tu carrera y empiezas a responder preguntas reales de exámenes pasados. El sistema registra tus fallos para que los refuerces luego." },
                { q: "¿Las explicaciones con IA son ilimitadas?", a: "Sí, todos los planes premium incluyen acceso a nuestro tutor de IA que te explica el 'por qué' de cada respuesta paso a paso." },
                { q: "¿Puedo cancelar mi plan cuando quiera?", a: "Por supuesto. No tenemos contratos de permanencia. Puedes estudiar un mes y cancelar sin compromisos." }
              ].map((faq, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all">
                  <div className="flex items-start gap-6">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      ?
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">
                        {faq.q}
                      </h4>
                      <p className="text-white/40 leading-relaxed italic">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <div className="mb-8 opacity-20">
          <BrandMark />
        </div>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
          &copy; {new Date().getFullYear()} StudyHub — Tu futuro empieza aquí
        </p>
      </footer>
    </div>
  );
}
