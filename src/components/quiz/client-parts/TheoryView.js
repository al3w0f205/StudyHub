// TheoryView — Vista de material de estudio (teoría) con soporte Markdown/LaTeX.
// Funciones: guardar offline (localStorage), descargar PDF (window.print),
// empezar quiz desde la teoría. Incluye estilos @media print para generar PDFs limpios.
"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
const MathText = dynamic(() => import("@/components/ui/MathText"));

export default function TheoryView({
  careerName,
  categoryName,
  isOfflineMode,
  saveOffline,
  total,
  setView,
  theory,
}) {
  return (
    <div className="animate-fade-in">
       <div className="quiz-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link href="/quiz" className="quiz-breadcrumb" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
              🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span> <strong style={{ color: "var(--accent-400)" }}>{categoryName}</strong>
            </Link>
            {isOfflineMode && <span style={{ background: "var(--success-400)", color: "black", fontSize: "0.625rem", fontWeight: 800, padding: "0.125rem 0.375rem", borderRadius: "4px", textTransform: "uppercase" }}>Offline</span>}
          </div>
          <h1 className="quiz-question-number">Material de Estudio</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={saveOffline} className="btn btn-secondary btn-sm" style={{ border: "1px solid var(--border-default)" }}>
            📥 Guardar Offline
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm" style={{ border: "1px solid var(--border-default)" }}>
            📄 Descargar PDF
          </button>
          {total > 0 && <button onClick={() => setView("quiz")} className="btn btn-primary btn-sm">Empezar Quiz →</button>}
          <Link href="/quiz" className="btn btn-sm btn-secondary" style={{ border: "1px solid var(--border-default)", fontWeight: 700 }}>
            SALIR ✕
          </Link>
        </div>
      </div>

      <div className="solid-card printable-content" style={{ padding: "2rem", lineHeight: 1.8 }}>
        <MathText className="theory-content">{theory}</MathText>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .quiz-sidebar, .quiz-header, .quiz-mobile-toggle, .btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
