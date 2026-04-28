import Link from "next/link";
import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const dashboardUrl = isAdmin ? "/admin" : "/dashboard";

  const [totalQuestions, careersData] = await Promise.all([
    prisma.question.count(),
    prisma.career.findMany({
      select: {
        name: true,
        categories: {
          select: {
            _count: {
              select: { questions: true }
            }
          }
        }
      }
    })
  ]);

  const statsByCareer = careersData.map(c => {
    const qCount = c.categories.reduce((acc, cat) => acc + cat._count.questions, 0);
    return { name: c.name, questionCount: qCount };
  }).filter(c => c.questionCount > 0);
  
  // Format total with commas
  const totalFormatted = new Intl.NumberFormat("en-US").format(totalQuestions);

  return (
    <div className="landing-page" style={{ 
      background: "#09090b", 
      color: "#fafafa", 
      minHeight: "100vh", 
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflowX: "hidden" 
    }}>
      {/* ── Subtle Background Glow & Grid ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M59 60H0V0h60v60zM1 1v58h58V1H1z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        maskImage: "linear-gradient(to bottom, white 10%, transparent 80%)",
        WebkitMaskImage: "linear-gradient(to bottom, white 10%, transparent 80%)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100vw",
        height: "500px",
        background: "radial-gradient(ellipse at top, rgba(45, 212, 191, 0.15), transparent 70%)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* ── Navigation ── */}
      <nav style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.5rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#09090b", fontWeight: "900", fontSize: "1.2rem"
          }}>S</div>
          <span style={{ fontSize: "1.125rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
            StudyHub
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isLoggedIn ? (
            <>
              <Link href={dashboardUrl} style={{
                padding: "0.5rem 1rem", borderRadius: "6px", background: "#fff", color: "#09090b",
                fontWeight: "600", fontSize: "0.875rem", textDecoration: "none", transition: "all 0.2s"
              }}>
                Ir al Panel
              </Link>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}>
                <button type="submit" style={{
                  padding: "0.5rem 1rem", background: "transparent", border: "none", color: "#a1a1aa",
                  fontWeight: "500", fontSize: "0.875rem", cursor: "pointer"
                }}>
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{
                color: "#a1a1aa", textDecoration: "none", fontSize: "0.875rem", fontWeight: "500", padding: "0.5rem"
              }}>
                Ingresar
              </Link>
              <Link href="/auth/login" style={{
                padding: "0.5rem 1rem", borderRadius: "6px", background: "#fff", color: "#09090b",
                fontWeight: "600", fontSize: "0.875rem", textDecoration: "none", transition: "all 0.2s"
              }}>
                Comenzar Gratis
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem 6rem", textAlign: "center" }}>
        
        <div style={{
          display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "9999px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#d4d4d8", fontSize: "0.8125rem", fontWeight: "500", marginBottom: "2rem",
          letterSpacing: "0.02em"
        }}>
          La nueva forma de prepararse para exámenes ✨
        </div>

        <h1 style={{
          fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: "800", lineHeight: "1.05",
          letterSpacing: "-0.04em", margin: "0 auto 1.5rem", maxWidth: "900px", color: "#fff"
        }}>
          Estudia menos. <br/>
          <span style={{ color: "#2dd4bf" }}>Aprende más rápido.</span>
        </h1>

        <p style={{
          fontSize: "clamp(1.125rem, 2vw, 1.375rem)", color: "#a1a1aa", maxWidth: "600px",
          margin: "0 auto 3rem", lineHeight: "1.5", fontWeight: "400"
        }}>
          Simulacros precisos, explicaciones detalladas y estadísticas de tu progreso para estudiantes universitarios que quieren asegurar su nota.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link href={isLoggedIn ? dashboardUrl : "/auth/login"} style={{
            padding: "0.875rem 2rem", borderRadius: "8px", background: "#2dd4bf", color: "#042f2e",
            fontWeight: "600", fontSize: "1rem", textDecoration: "none", transition: "transform 0.2s",
            boxShadow: "0 4px 14px 0 rgba(45, 212, 191, 0.39)"
          }}>
            Empezar a estudiar
          </Link>
        </div>

        {/* Hero Mockup Graphic */}
        <div style={{
          marginTop: "5rem", position: "relative",
          maxWidth: "900px", margin: "5rem auto 0",
          background: "rgba(24, 24, 27, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px", padding: "1rem", boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)"
        }}>
          {/* Mock UI Header */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", padding: "0.5rem" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }}/>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#eab308" }}/>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e" }}/>
          </div>
          {/* Mock Content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", textAlign: "left" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "1.5rem" }}>
              <div style={{ width: "40%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginBottom: "1.5rem" }}/>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "0.75rem" }}/>
              <div style={{ width: "80%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "0.75rem" }}/>
              <div style={{ width: "90%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", marginBottom: "2rem" }}/>
              <div style={{ width: "100%", height: "8px", background: "rgba(45, 212, 191, 0.2)", borderRadius: "4px" }}/>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "2rem" }}>
              <div style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1.5rem" }}>Pregunta de Anatomía #42</div>
              
              <div style={{ padding: "0.875rem 1rem", border: "1px solid rgba(45, 212, 191, 0.5)", borderRadius: "6px", marginBottom: "0.75rem", background: "rgba(45, 212, 191, 0.05)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(45, 212, 191, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2dd4bf", fontSize: "0.75rem", fontWeight: "bold" }}>A</div>
                <div style={{ color: "#2dd4bf", fontSize: "0.875rem", fontWeight: "500" }}>El nervio mediano inerva los músculos flexores del antebrazo.</div>
              </div>

              <div style={{ padding: "0.875rem 1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.6 }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: "bold" }}>B</div>
                <div style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>El nervio cubital es el principal inervador de la cara anterior.</div>
              </div>

              <div style={{ padding: "0.875rem 1rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.6 }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: "bold" }}>C</div>
                <div style={{ color: "#a1a1aa", fontSize: "0.875rem" }}>El nervio radial se origina en el fascículo posterior del plexo.</div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ── Social Proof ── */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "3rem 2rem", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#71717a", fontSize: "0.875rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>
            Con la confianza de estudiantes en
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "4rem", flexWrap: "wrap", opacity: 0.6, filter: "grayscale(100%)" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: "900", fontFamily: "system-ui" }}>UIDE</span>
            <span style={{ fontSize: "2rem", fontWeight: "600", fontFamily: "serif", fontStyle: "italic" }}>udla</span>
            <span style={{ fontSize: "1.75rem", fontWeight: "800", fontFamily: "sans-serif" }}>PUCE</span>
            <span style={{ fontSize: "1.75rem", fontWeight: "700", fontFamily: "system-ui", letterSpacing: "-1px" }}>USFQ</span>
          </div>
        </div>
      </section>

      {/* ── Realtime Stats ── */}
      <section style={{ padding: "6rem 2rem", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "9999px",
            background: "rgba(45, 212, 191, 0.1)", border: "1px solid rgba(45, 212, 191, 0.2)",
            color: "#2dd4bf", fontSize: "0.75rem", fontWeight: "600", marginBottom: "1.5rem",
            textTransform: "uppercase", letterSpacing: "0.05em"
          }}>
            Actualizado en Tiempo Real
          </div>
          
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
            Un banco de <span style={{ color: "#2dd4bf" }}>{totalFormatted}</span> preguntas
          </h2>
          <p style={{ color: "#a1a1aa", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto 4rem" }}>
            Expandimos continuamente nuestro contenido. Estas son las preguntas disponibles ahora mismo por cada carrera:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            {statsByCareer.map((career, i) => (
              <div key={i} className="solid-card" style={{
                padding: "1.5rem", borderRadius: "16px", background: "rgba(255,255,255,0.02)", 
                border: "1px solid rgba(255,255,255,0.05)", textAlign: "left",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontSize: "1.125rem", fontWeight: "600", color: "#fff" }}>{career.name}</span>
                <span style={{ 
                  background: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.25rem 0.75rem", 
                  borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "600" 
                }}>
                  {new Intl.NumberFormat("en-US").format(career.questionCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features BENTO GRID ── */}
      <section style={{ padding: "8rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
            Todo lo que necesitas. <br/> Nada de lo que no.
          </h2>
          <p style={{ color: "#a1a1aa", fontSize: "1.125rem", maxWidth: "500px", margin: "0 auto" }}>
            Diseñado meticulosamente para eliminar distracciones y enfocarse en la retención.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Feature 1 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "2.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(45, 212, 191, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.75rem", color: "#fff" }}>Cuestionarios Específicos</h3>
            <p style={{ color: "#a1a1aa", lineHeight: "1.6", fontSize: "0.9375rem" }}>
              No estudies a ciegas. Nuestras preguntas están categorizadas exactamente por carrera y semestre.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "2.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(250, 204, 21, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.75rem", color: "#fff" }}>Justificaciones Claras</h3>
            <p style={{ color: "#a1a1aa", lineHeight: "1.6", fontSize: "0.9375rem" }}>
              Saber la respuesta no es suficiente. Te explicamos paso a paso por qué es correcta.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "2.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(96, 165, 250, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.75rem", color: "#fff" }}>Analíticas en Tiempo Real</h3>
            <p style={{ color: "#a1a1aa", lineHeight: "1.6", fontSize: "0.9375rem" }}>
              Visualiza en qué temas eres fuerte y cuáles necesitan más repaso antes del examen final.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: "8rem 2rem", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "1rem" }}>
              Cómo funciona StudyHub
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
              Un proceso simple diseñado para maximizar tu retención y prepararte para el mundo real.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "3rem" }}>
            {[
              { step: "01", title: "Elige tu área", desc: "Selecciona tu carrera y la categoría específica que necesitas estudiar para tu próximo parcial." },
              { step: "02", title: "Practica a tu ritmo", desc: "Responde preguntas con o sin límite de tiempo. Usa pistas si te atascas en conceptos difíciles." },
              { step: "03", title: "Aprende del error", desc: "Lee las justificaciones detalladas de cada respuesta para entender el porqué, no solo memorizar." }
            ].map((item, i) => (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ fontSize: "4rem", fontWeight: "900", color: "rgba(255,255,255,0.05)", lineHeight: 1, marginBottom: "1rem" }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.75rem", color: "#fff" }}>{item.title}</h3>
                <p style={{ color: "#a1a1aa", lineHeight: "1.6" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ padding: "4rem 2rem 8rem", textAlign: "center", background: "linear-gradient(to bottom, transparent, rgba(45, 212, 191, 0.03))" }}>
        <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "3rem" }}>
          Simple. Transparente.
        </h2>

        <div style={{
          background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px",
          padding: "3rem", maxWidth: "400px", margin: "0 auto", textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "500", color: "#a1a1aa", marginBottom: "1rem" }}>Acceso Ilimitado</h3>
          <div style={{ fontSize: "4rem", fontWeight: "800", color: "#fff", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>
            $10
            <span style={{ fontSize: "1rem", fontWeight: "500", color: "#71717a", letterSpacing: "normal" }}>/mes</span>
          </div>
          <p style={{ color: "#71717a", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Una inversión mínima para tu éxito académico.
          </p>

          <Link href={isLoggedIn ? dashboardUrl : "/auth/login"} style={{
            display: "block", padding: "1rem 2rem", borderRadius: "8px", background: "#fff", color: "#09090b",
            fontWeight: "600", fontSize: "1rem", textDecoration: "none", transition: "background 0.2s",
            marginBottom: "2rem"
          }}>
            Suscribirse Ahora
          </Link>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["Acceso a todas las preguntas", "Explicaciones de cada respuesta", "Soporte y nuevas actualizaciones"].map((feature, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#d4d4d8", fontSize: "0.875rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "8rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)", fontWeight: "800", letterSpacing: "-0.03em" }}>
            Preguntas Frecuentes
          </h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { q: "¿Cómo se actualizan las preguntas?", a: "Nuestro banco de preguntas es revisado y actualizado continuamente por estudiantes destacados y colaboradores. Si encuentras un error, puedes reportarlo fácilmente." },
            { q: "¿Cómo funciona el proceso de pago?", a: "Actualmente procesamos los pagos de forma manual para mayor seguridad. Envías el comprobante de transferencia y un administrador activará tu cuenta y las carreras que solicites en menos de 24 horas." },
            { q: "¿Puedo acceder desde mi celular?", a: "¡Sí! StudyHub está optimizado 100% para funcionar perfectamente en dispositivos móviles. Puedes estudiar en el bus, en la cafetería o donde quieras." },
            { q: "¿Qué pasa si mi carrera no está disponible?", a: "Estamos agregando nuevas carreras cada mes. Si tienes material y quieres colaborar para abrir tu carrera en la plataforma, contáctanos y obtendrás beneficios exclusivos." }
          ].map((faq, i) => (
            <div key={i} className="solid-card" style={{ padding: "1.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#fff", marginBottom: "0.5rem" }}>{faq.q}</h3>
              <p style={{ color: "#a1a1aa", fontSize: "0.9375rem", lineHeight: "1.6" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: "6rem 2rem", textAlign: "center", background: "radial-gradient(ellipse at bottom, rgba(45, 212, 191, 0.1), transparent 60%)" }}>
        <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: "800", letterSpacing: "-0.04em", marginBottom: "1.5rem", color: "#fff" }}>
          ¿Listo para <span style={{ color: "#2dd4bf" }}>aprobar</span>?
        </h2>
        <p style={{ color: "#a1a1aa", fontSize: "1.125rem", maxWidth: "500px", margin: "0 auto 3rem" }}>
          Únete a la plataforma que está cambiando la forma de estudiar en la universidad.
        </p>
        <Link href={isLoggedIn ? dashboardUrl : "/auth/login"} className="btn btn-primary" style={{
          padding: "1rem 2.5rem", borderRadius: "8px", background: "#fff", color: "#09090b",
          fontWeight: "700", fontSize: "1.125rem", textDecoration: "none", display: "inline-block"
        }}>
          Empezar a Estudiar
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem", textAlign: "center", color: "#71717a", fontSize: "0.875rem"
      }}>
        <p>© {new Date().getFullYear()} StudyHub. Construido para estudiantes.</p>
      </footer>
    </div>
  );
}
