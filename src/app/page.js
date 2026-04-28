import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ── Background Grid & Ambient Glow ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-hero)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm39 39V1H1v38h38z' fill='%23ffffff' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          maskImage: "linear-gradient(to bottom, white 10%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to bottom, white 10%, transparent 80%)",
          zIndex: 1,
        }}
      />

      {/* ── Navigation ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "max(1.5rem, env(safe-area-inset-top)) 1.5rem 1rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.125rem",
              fontWeight: "800",
              color: "white",
            }}
          >
            S
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
            Study<span style={{ color: "var(--primary-400)" }}>Hub</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn btn-ghost hidden sm:inline-flex" id="nav-login-btn">
            Iniciar Sesión
          </Link>
          <Link href="/auth/login" className="btn btn-primary btn-sm" id="nav-signup-btn">
            Comenzar Gratis
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2rem 1.5rem 2rem",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in flex items-center justify-center text-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(14, 165, 233, 0.15)",
            border: "1px solid rgba(14, 165, 233, 0.3)",
            color: "var(--primary-50)",
            marginBottom: "2rem",
            width: "fit-content",
            margin: "0 auto 2rem",
          }}
        >
          <span className="text-xs sm:text-sm">🎓</span>
          <span className="text-xs sm:text-sm font-semibold">Plataforma de Estudio #1 para Universitarios</span>
        </div>

        {/* Title */}
        <h1
          className="animate-fade-in animate-fade-in-delay-1"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: "900",
            lineHeight: "1.05",
            letterSpacing: "-0.04em",
            marginBottom: "1.5rem",
          }}
        >
          Domina tus exámenes
          <br />
          <span
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            con confianza
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in animate-fade-in-delay-2"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--text-secondary)",
            maxWidth: "640px",
            margin: "0 auto 2.5rem",
            lineHeight: "1.6",
          }}
        >
          Miles de preguntas organizadas por carrera con explicaciones detalladas,
          pistas inteligentes y simulacros realistas. Tu mejor herramienta de
          preparación universitaria.
        </p>

        {/* CTA Buttons */}
        <div 
          className="animate-fade-in animate-fade-in-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto sm:max-w-none"
          style={{ marginBottom: "4rem" }}
        >
          <Link href="/auth/login" className="btn btn-primary btn-lg animate-pulse-glow w-full sm:w-auto flex justify-center" id="hero-cta-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Empezar Ahora
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg w-full sm:w-auto flex justify-center" style={{ border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)" }} id="hero-features-btn">
            Conocer Más
          </Link>
        </div>

        {/* ── Stats ── */}
        <div
          className="animate-fade-in animate-fade-in-delay-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
            maxWidth: "600px",
            margin: "0 auto 5rem",
          }}
        >
          {[
            { value: "2,000+", label: "Preguntas" },
            { value: "$10", label: "USD / mes" },
            { value: "24/7", label: "Acceso Total" },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: "1.25rem" }}>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Features Section ── */}
        <section id="features" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              marginBottom: "0.75rem",
            }}
          >
            Todo lo que necesitas para{" "}
            <span style={{ color: "var(--primary-400)" }}>aprobar</span>
          </h2>
          <p
            style={{
              color: "var(--text-tertiary)",
              marginBottom: "3rem",
              fontSize: "1rem",
            }}
          >
            Herramientas diseñadas específicamente para estudiantes universitarios
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.25rem",
              textAlign: "left",
            }}
          >
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
                title: "Cuestionarios por Carrera",
                desc: "Preguntas organizadas por carrera y materia. Practica exactamente lo que necesitas para tu próximo examen.",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
                title: "Pistas Inteligentes",
                desc: "¿Atascado en una pregunta? Usa las pistas para guiar tu razonamiento sin revelar la respuesta directamente.",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
                title: "Explicaciones Detalladas",
                desc: "Cada respuesta incluye una justificación completa para que entiendas el porqué, no solo el qué.",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>,
                title: "Estudia Donde Sea",
                desc: "Aplicación web progresiva que funciona en cualquier dispositivo. Instálala como app en tu teléfono.",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
                title: "Acceso Premium",
                desc: "Suscripción mensual de solo $10 USD. Acceso completo a todo el banco de preguntas y nuevas adiciones.",
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
                title: "Colaboración",
                desc: "Sugiere preguntas para que otros estudiantes se beneficien. Juntos construimos un mejor recurso de estudio.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="solid-card"
                style={{ padding: "1.5rem" }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--glass-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.25rem",
                    marginBottom: "1rem",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-tertiary)",
                    lineHeight: "1.6",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Social Proof ── */}
        <section style={{ paddingBottom: "4rem" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
            Utilizado y confiado por estudiantes de
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(1.5rem, 4vw, 3rem)", flexWrap: "wrap", opacity: 0.5 }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "700", letterSpacing: "0.05em" }}>UIDE</span>
            <span style={{ fontSize: "1.25rem", fontWeight: "700", letterSpacing: "0.05em" }}>UDLA</span>
          </div>
        </section>

        {/* ── Pricing Section ── */}
        <section style={{ paddingBottom: "4rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: "800",
              letterSpacing: "-0.03em",
              marginBottom: "0.75rem",
            }}
          >
            Un solo plan,{" "}
            <span style={{ color: "var(--accent-400)" }}>acceso completo</span>
          </h2>
          <p
            style={{
              color: "var(--text-tertiary)",
              marginBottom: "3rem",
              fontSize: "1rem",
            }}
          >
            Sin sorpresas, sin planes ocultos
          </p>

          <div
            className="glass-card animate-pulse-glow"
            style={{
              maxWidth: "400px",
              margin: "0 auto",
              padding: "2.5rem 2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "var(--gradient-primary)",
              }}
            />
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "var(--primary-400)",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Premium
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
              <span
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "900",
                  letterSpacing: "-0.04em",
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                $10
              </span>
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                USD / mes
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "2rem" }}>
              Acceso ilimitado a todo el contenido
            </p>

            <ul style={{ listStyle: "none", marginBottom: "2rem", textAlign: "left" }}>
              {[
                "Acceso a todas las preguntas",
                "Explicaciones detalladas",
                "Pistas inteligentes",
                "Nuevas preguntas cada semana",
                "Acceso desde cualquier dispositivo",
                "Propón preguntas al sistema",
              ].map((item, i) => (
                <li
                  key={i}
                  style={{
                    padding: "0.5rem 0",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-400)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/auth/login" className="btn btn-primary btn-lg" style={{ width: "100%" }} id="pricing-cta-btn">
              Suscribirse
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: "1px solid var(--border-default)",
            padding: "2rem 0",
            color: "var(--text-tertiary)",
            fontSize: "0.8125rem",
          }}
        >
          <p>© {new Date().getFullYear()} StudyHub. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
