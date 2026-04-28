import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      {/* ── Decorative Glow Orbs ── */}
      <div
        className="glow-orb"
        style={{
          width: "600px",
          height: "600px",
          top: "-200px",
          right: "-100px",
          background: "var(--primary-600)",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: "400px",
          height: "400px",
          bottom: "-100px",
          left: "-100px",
          background: "var(--accent-500)",
          opacity: "0.1",
        }}
      />
      <div
        className="glow-orb"
        style={{
          width: "300px",
          height: "300px",
          top: "50%",
          left: "50%",
          background: "var(--primary-500)",
          opacity: "0.08",
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
          padding: "1.25rem 2rem",
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/auth/login" className="btn btn-ghost" id="nav-login-btn">
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
          padding: "4rem 2rem 2rem",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.375rem 1rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            fontSize: "0.8125rem",
            fontWeight: "600",
            color: "var(--primary-400)",
            marginBottom: "2rem",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>🎓</span>
          Plataforma de Estudio #1 para Universitarios
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
          className="animate-fade-in animate-fade-in-delay-3"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "4rem",
          }}
        >
          <Link href="/auth/login" className="btn btn-primary btn-lg animate-pulse-glow" id="hero-cta-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Empezar Ahora
          </Link>
          <Link href="#features" className="btn btn-secondary btn-lg" id="hero-features-btn">
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
                icon: "📚",
                title: "Cuestionarios por Carrera",
                desc: "Preguntas organizadas por carrera y materia. Practica exactamente lo que necesitas para tu próximo examen.",
              },
              {
                icon: "💡",
                title: "Pistas Inteligentes",
                desc: "¿Atascado en una pregunta? Usa las pistas para guiar tu razonamiento sin revelar la respuesta directamente.",
              },
              {
                icon: "📖",
                title: "Explicaciones Detalladas",
                desc: "Cada respuesta incluye una justificación completa para que entiendas el porqué, no solo el qué.",
              },
              {
                icon: "📱",
                title: "Estudia Donde Sea",
                desc: "Aplicación web progresiva que funciona en cualquier dispositivo. Instálala como app en tu teléfono.",
              },
              {
                icon: "🔒",
                title: "Acceso Premium",
                desc: "Suscripción mensual de solo $10 USD. Acceso completo a todo el banco de preguntas y nuevas adiciones.",
              },
              {
                icon: "✨",
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
