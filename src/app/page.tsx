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
  <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-lg shadow-lg" />
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

      {/* ── Cinematic Hero ── */}
      <MassivelyHero 
        isLoggedIn={isLoggedIn} 
        dashboardUrl={dashboardUrl} 
      />

      {/* ── Main Content Body ── */}
      <main className="massively-main">
        {/* Stats Section */}
        <section id="stats" className="massively-section pt-40">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <span className="text-blue-500 font-medium uppercase tracking-widest text-[11px] mb-4 block">
              Contenido Verificado
            </span>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight tracking-tighter">
              Domina <span className="text-blue-400">{totalQuestions.toLocaleString()}</span> Preguntas Clave
            </h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto leading-relaxed font-medium">
              Accede a bancos de preguntas cuidadosamente seleccionados y organizados para asegurar tu ingreso a la universidad.
            </p>
          </div>

          <AnimatedProductPreview totalFormatted={totalFormatted} topCareer={topCareer} />
        </section>

        {/* Features Section */}
        <section id="features" className="massively-section bg-white/[0.01]">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="magnetic-card">
              <Zap className="text-blue-400 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-4 text-white">Práctica Real</h3>
              <p className="text-white/40 leading-relaxed font-normal">
                Simulacros que replican fielmente la dificultad y estructura de los exámenes de admisión oficiales.
              </p>
            </div>
            <div className="magnetic-card">
              <ShieldCheck className="text-indigo-400 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-4 text-white">Explicaciones Expertas</h3>
              <p className="text-white/40 leading-relaxed font-normal">
                Cada respuesta incluye una justificación detallada para que entiendas el concepto de fondo.
              </p>
            </div>
            <div className="magnetic-card">
              <Sparkles className="text-blue-300 mb-6" size={32} />
              <h3 className="text-2xl font-bold mb-4 text-white">Gestión Personalizada</h3>
              <p className="text-white/40 leading-relaxed font-normal">
                Seguimiento de tu progreso real para que te enfoques en las materias que más necesitas reforzar.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section - Manual Activation Model */}
        <section id="pricing" className="massively-section relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium uppercase tracking-[0.3em] mb-6">
                Suscripción Directa
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
                Invierte en tu Ingreso
              </h2>
              <p className="text-blue-100/40 max-w-2xl mx-auto font-light leading-loose">
                El acceso se activa mediante transferencia bancaria y verificación de comprobante. Proceso transparente y atención directa.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Plan Inicial */}
              <div className="magnetic-card border-white/5 bg-white/[0.01] flex flex-col">
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white/60 mb-2">Modo Demo</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$0</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {['Preguntas diarias limitadas', 'Justificaciones básicas', 'Acceso a 1 facultad', 'Sin simulacros avanzados'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/50 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-center hover:bg-white/10 transition-all">
                  Explorar Plataforma
                </Link>
              </div>

              {/* Plan Premium */}
              <div className="magnetic-card border-blue-500/30 bg-blue-500/[0.02] relative overflow-hidden flex flex-col group">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-5 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-lg">
                  Acceso Total
                </div>
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-blue-400 mb-2">Suscripción Premium</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">$9.99</span>
                    <span className="text-blue-200/30 text-sm">/ acceso</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10 flex-grow">
                  {['Preguntas ilimitadas', 'Explicaciones expertas detalladas', 'Todas las carreras incluidas', 'Simulacros tipo examen ilimitados', 'Soporte vía WhatsApp'].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-blue-50/70 text-sm font-normal">
                      <CheckCircle2 className="text-blue-500" size={18} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/login" className="w-full py-4 rounded-xl bg-blue-600 text-white font-medium text-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                  Activar con Transferencia
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Clear Process */}
        <section id="preguntas" className="massively-section bg-black/20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">¿Cómo empezar?</h2>
              <div className="w-16 h-1 bg-cyan-500 mx-auto rounded-full opacity-50" />
            </div>
            
            <div className="grid gap-6">
              {[
                { q: "¿Cómo se activa mi suscripción?", a: "Tras realizar tu transferencia, inicia sesión y sube tu comprobante en la sección de pagos. Nuestro equipo verificará la transacción y activará tu acceso en un máximo de 24 horas." },
                { q: "¿Cuáles son los métodos de pago?", a: "Aceptamos transferencias bancarias y depósitos locales. Los datos bancarios se proporcionan una vez que inicias sesión y seleccionas el acceso Premium." },
                { q: "¿Puedo estudiar en varios dispositivos?", a: "Sí, tu cuenta es personal y puedes acceder desde tu PC, tablet o móvil para estudiar en cualquier lugar." },
                { q: "¿Ofrecen devoluciones?", a: "Debido a que el acceso es inmediato y digital, no ofrecemos devoluciones, pero garantizamos que el contenido es el más actualizado del mercado." }
              ].map((faq, i) => (
                <div key={i} className="group p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-cyan-500/30 transition-all duration-500">
                  <h4 className="text-lg md:text-xl font-bold mb-4 text-cyan-400/90 group-hover:text-cyan-400">
                    {faq.q}
                  </h4>
                  <p className="text-white/50 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-white/5 bg-black/40">
        <div className="flex flex-col items-center gap-10 max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="w-6 h-6 bg-blue-600 rounded-md rotate-12" />
            <span className="font-black tracking-tighter">STUDYHUB</span>
          </div>
          <div className="flex flex-wrap justify-center gap-10 text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
            <Link href="/terms" className="hover:text-blue-400 transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacidad</Link>
            <Link href="/support" className="hover:text-blue-400 transition-colors">Soporte</Link>
          </div>
          <p className="text-white/10 text-[10px] font-light uppercase tracking-[0.8em] leading-loose">
            &copy; {new Date().getFullYear()} StudyHub — Elevando tu potencial académico
          </p>
        </div>
      </footer>
    </div>
  );
}
