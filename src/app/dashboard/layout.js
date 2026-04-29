"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const navSections = [
  {
    title: "Estudio",
    items: [
      { href: "/dashboard", label: "Inicio", description: "Resumen y accesos rápidos", icon: "🏠" },
      { href: "/quiz", label: "Carreras y Cuestionarios", description: "Elige carrera, categoría y modo", icon: "📝" },
      { href: "/quiz/repaso", label: "Repaso Inteligente", description: "Refuerza preguntas difíciles", icon: "🧠" },
    ],
  },
  {
    title: "Progreso",
    items: [
      { href: "/leaderboard", label: "Estadísticas Globales", description: "Comparte ranking con estudiantes", icon: "📊" },
      { href: "/badges", label: "Medallas y Logros", description: "Sigue tus avances desbloqueados", icon: "🏅" },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { href: "/payment", label: "Suscripción y Pago", description: "Gestiona tu acceso", icon: "💳" },
      { href: "/suggest", label: "Sugerir Preguntas", description: "Aporta contenido a la comunidad", icon: "💡" },
      { href: "/updates", label: "Novedades", description: "Funciones y mejoras recientes", icon: "🚀" },
      { href: "/settings", label: "Configuración", description: "Ajustes de tu cuenta", icon: "⚙️" },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isActivePath = (href) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      {sidebarOpen && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid var(--border-default)", marginBottom: "1rem" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 800, color: "white" }}>S</div>
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>Study<span style={{ color: "var(--primary-400)" }}>Hub</span></span>
          </Link>
        </div>

        <nav className="sidebar-nav-scroll">
          {navSections.map((section) => (
            <div key={section.title} className="sidebar-nav-group">
              <div className="sidebar-nav-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link sidebar-link-rich ${isActivePath(item.href) ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span style={{ fontSize: "1.125rem" }}>{item.icon}</span>
                  <span style={{ display: "grid", gap: "0.125rem" }}>
                    <span>{item.label}</span>
                    <span className="sidebar-link-meta">{item.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-default)" }}>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="sidebar-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0", fontSize: "0.8125rem", fontFamily: "inherit", color: "var(--text-secondary)" }}>
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: 260, padding: "1.5rem 2rem", minHeight: "100dvh" }} className="user-main">
        <div className="mobile-header-user" style={{ display: "none", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontWeight: 700 }}>StudyHub</span>
        </div>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .user-main { margin-left: 0 !important; padding: 1rem !important; }
          .mobile-header-user { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
