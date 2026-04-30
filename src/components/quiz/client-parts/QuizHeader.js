// QuizHeader — Barra superior del quiz.
// Muestra: breadcrumbs (carrera/categoría), número de pregunta, badge offline,
// timer de presión, score tracker (✓/✗), botón Zen Mode, y botón Admin Edit.
"use client";
import Link from "next/link";
import { Edit2 } from "lucide-react";

export default function QuizHeader({
  careerName,
  categoryName,
  isOfflineMode,
  isExamMode,
  current,
  total,
  initialCompletedCount,
  totalQuestionsInCategory,
  isTimePressure,
  selected,
  timeLeft,
  score,
  answered,
  isZenMode,
  setIsZenMode,
  setIsExamMode,
  isAdmin,
  onEdit,
}) {
  return (
    <div className="quiz-header quiz-topbar">
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Link href="/quiz" className="quiz-breadcrumb" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
            🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span> <strong style={{ color: "var(--accent-400)" }}>{categoryName}</strong>
          </Link>
          {isOfflineMode && (
            <span style={{ background: "var(--success-400)", color: "black", fontSize: "0.625rem", fontWeight: 800, padding: "0.125rem 0.375rem", borderRadius: "4px", textTransform: "uppercase" }}>
              Offline
            </span>
          )}
        </div>

        <h1 className="quiz-question-number">
          {isExamMode ? "Simulacro — " : ""}
          Pregunta {current + 1} <span style={{ color: "var(--text-tertiary)", fontSize: "1rem", fontWeight: 500 }}>/ {total}</span>
          {totalQuestionsInCategory > total && (
            <span style={{ fontSize: "0.75rem", color: "var(--success-400)", marginLeft: "0.5rem" }}>
              ({initialCompletedCount} ya completadas)
            </span>
          )}
        </h1>
      </div>
      
      <div className="quiz-top-actions" style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
        {isTimePressure && selected === null && (
          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: timeLeft <= 5 ? "var(--danger-400)" : "var(--warning-400)" }}>
            00:{timeLeft.toString().padStart(2, "0")}
          </div>
        )}
        {!isZenMode && (
          <div className="solid-card" style={{ padding: "0.375rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--success-400)" }}>{score} ✓</span>
            <span style={{ color: "var(--border-default)" }}>|</span>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--danger-400)" }}>{answered - score} ✗</span>
          </div>
        )}
        {isZenMode && (
          <button onClick={() => { setIsZenMode(false); setIsExamMode(false); }} className="btn btn-sm btn-secondary">
            Salir Modo Enfoque
          </button>
        )}
        {isAdmin && !isOfflineMode && !isExamMode && (
          <button 
            onClick={onEdit} 
            className="btn btn-sm btn-secondary"
            style={{ border: "1px solid var(--primary-400)", color: "var(--primary-400)" }}
          >
            <Edit2 size={14} style={{ marginRight: "0.25rem" }} /> Editar
          </button>
        )}
        <Link href="/quiz" className="btn btn-sm btn-secondary" style={{ border: "1px solid var(--border-default)", fontWeight: 700 }}>
          SALIR ✕
        </Link>
      </div>
    </div>
  );
}
