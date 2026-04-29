"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/careers", label: "Carreras", icon: "🎓" },
  { href: "/admin/categories", label: "Categorías", icon: "📁" },
  { href: "/admin/questions", label: "Preguntas", icon: "❓" },
  { href: "/admin/payments", label: "Pagos", icon: "💳" },
  { href: "/admin/users", label: "Usuarios", icon: "👥" },
  { href: "/admin/error-reports", label: "Reportes", icon: "🚩" },
  { href: "/admin/updates", label: "Actualizaciones", icon: "🚀" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div
          style={{
            padding: "0 1.5rem 1.5rem",
            borderBottom: "1px solid var(--border-default)",
            marginBottom: "1rem",
          }}
        >
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                fontWeight: "800",
                color: "white",
              }}
            >
              S
            </div>
            <span style={{ fontSize: "1rem", fontWeight: "700" }}>
              Study<span style={{ color: "var(--primary-400)" }}>Hub</span>
            </span>
            <span className="badge badge-primary" style={{ marginLeft: "auto" }}>
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ fontSize: "1.125rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div
          style={{
            marginTop: "auto",
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-default)",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <Link
            href="/"
            className="sidebar-link"
            style={{ padding: "0.5rem 0", fontSize: "0.8125rem" }}
          >
            <span>🏠</span> Ir al Sitio
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "260px",
          padding: "1.5rem 2rem",
          minHeight: "100dvh",
        }}
        className="admin-main"
      >
        {/* Mobile header with hamburger */}
        <div
          className="mobile-header"
          style={{
            display: "none",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            id="sidebar-toggle-btn"
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: "700" }}>StudyHub Admin</span>
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-main {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
