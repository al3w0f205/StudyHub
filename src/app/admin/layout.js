"use client";

import { useState } from "react";
import SharedSidebar from "@/components/layout/SharedSidebar";

const navSections = [
  {
    title: "Administración",
    items: [
      { href: "/admin", label: "Dashboard", icon: "📊" },
      { href: "/admin/careers", label: "Carreras", icon: "🎓" },
      { href: "/admin/categories", label: "Categorías", icon: "📁" },
      { href: "/admin/questions", label: "Preguntas", icon: "❓" },
      { href: "/admin/payments", label: "Pagos", icon: "💳" },
      { href: "/admin/users", label: "Usuarios", icon: "👥" },
      { href: "/admin/error-reports", label: "Reportes", icon: "🚩" },
      { href: "/admin/updates", label: "Actualizaciones", icon: "🚀" },
    ],
  },
];

const bottomLinks = [
  { href: "/", label: "Ir al Sitio", icon: "🏠" }
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      {sidebarOpen && (
        <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      <SharedSidebar 
        sections={navSections}
        bottomLinks={bottomLinks}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        badge="Admin"
      />

      <main style={{ flex: 1, marginLeft: "260px", padding: "1.5rem 2rem", minHeight: "100dvh" }} className="admin-main">
        <div className="mobile-header" style={{ display: "none", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: "700" }}>StudyHub Admin</span>
        </div>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; padding: 1rem !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
