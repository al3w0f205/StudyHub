// SharedSidebar — Sidebar reutilizable para Admin y App layouts.
// Recibe configuración via props (sections, bottomLinks, badge, showSignOut).
// Admin layout pasa badge="Admin" y links de administración.
// App layout pasa links de estudio, progreso y cuenta con showSignOut=true.
// Usa usePathname() para resaltar el link activo.
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SharedSidebar({ 
  title = "StudyHub",
  logo = "S",
  sections = [],
  bottomLinks = [],
  sidebarOpen,
  setSidebarOpen,
  showSignOut = false,
  badge = null
}) {
  const pathname = usePathname();
  const isActivePath = (href) => (href === "/dashboard" || href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid var(--border-default)", marginBottom: "1rem" }}>
        <Link href={sections[0]?.items[0]?.href || "/"} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 800, color: "white" }}>
            {logo}
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 700 }}>
            {title.includes("Hub") ? (
              <>Study<span style={{ color: "var(--primary-400)" }}>Hub</span></>
            ) : title}
          </span>
          {badge && (
            <span className="badge badge-primary" style={{ marginLeft: "auto" }}>
              {badge}
            </span>
          )}
        </Link>
      </div>

      <nav className="sidebar-nav-scroll">
        {sections.map((section) => (
          <div key={section.title} className="sidebar-nav-group">
            <div className="sidebar-nav-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${item.description ? "sidebar-link-rich" : ""} ${isActivePath(item.href) ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span style={{ fontSize: "1.125rem" }}>{item.icon}</span>
                <span style={{ display: "grid", gap: "0.125rem" }}>
                  <span>{item.label}</span>
                  {item.description && <span className="sidebar-link-meta">{item.description}</span>}
                </span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "1rem 1.5rem", borderTop: "1px solid var(--border-default)" }}>
        {bottomLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.href}
            className="sidebar-link"
            style={{ padding: "0.5rem 0", fontSize: "0.8125rem" }}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
        {showSignOut && (
          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="sidebar-link" 
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0", fontSize: "0.8125rem", fontFamily: "inherit", color: "var(--text-secondary)", textAlign: "left" }}
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        )}
      </div>
    </aside>
  );
}
