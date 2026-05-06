"use client";

import Link from "next/link";
import React from "react";

interface QuizResultsProps {
  score: number;
  total: number;
  isExamMode: boolean;
  restart: () => void;
}

export default function QuizResults({
  score,
  total,
  isExamMode,
  restart,
}: QuizResultsProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="quiz-results-container">
      <div className="solid-card animate-fade-in quiz-results-card">
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
          {pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}
        </div>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}
        >
          {isExamMode ? "Simulacro Completado" : "Cuestionario Finalizado"}
        </h2>
        <div
          className="stat-value"
          style={{
            fontSize: "3.5rem",
            margin: "1rem 0",
            color:
              pct >= 70
                ? "var(--success-400)"
                : pct >= 50
                ? "var(--warning-400)"
                : "var(--danger-400)",
          }}
        >
          {pct}%
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
            fontSize: "1rem",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>{score}</strong>{" "}
          correctas de {total}
        </p>
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          {pct >= 70
            ? "¡Excelente dominio del tema!"
            : pct >= 50
            ? "Buen intento. Sigue practicando."
            : "Necesitas repasar estos conceptos."}
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => restart()} className="btn btn-primary">
            Repetir
          </button>
          <Link href="/quiz" className="btn btn-secondary">
            Volver al Menú
          </Link>
        </div>
      </div>
    </div>
  );
}
