"use client";

import { useEffect, useRef } from "react";

/**
 * ActionModal — Reusable modal wrapper for forms and reports.
 *
 * @param {boolean} open - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {string} title - Modal title text
 * @param {string} [subtitle] - Optional subtitle text
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} [footer] - Optional footer (buttons area)
 * @param {string} [maxWidth="480px"] - Max width of the modal panel
 */
export default function ActionModal({
  open,
  onClose,
  title,
  subtitle = null,
  children,
  footer = null,
  maxWidth = "480px",
}) {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="action-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        animation: "modalFadeIn 0.2s ease",
        padding: "1rem",
      }}
    >
      <div
        ref={panelRef}
        className="action-modal-panel solid-card"
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "85dvh",
          display: "flex",
          flexDirection: "column",
          animation: "modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "1.5rem 1.5rem 1rem",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, lineHeight: 1.3 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "var(--text-tertiary)",
              padding: "0.25rem",
              lineHeight: 1,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-tertiary)")}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-default)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
