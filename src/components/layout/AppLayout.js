// AppLayout — Layout principal para usuarios (no-admin).
// Estructura: sidebar fija (260px) + área de contenido flexible.
// En mobile (<768px): sidebar se oculta, aparece header con hamburger menu.
// Usa SharedSidebar con secciones de Estudio, Progreso y Cuenta.
"use client";

import { useState } from "react";
import SharedSidebar from "./SharedSidebar";

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

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      {sidebarOpen && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}

      <SharedSidebar 
        sections={navSections}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showSignOut={true}
      />

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
