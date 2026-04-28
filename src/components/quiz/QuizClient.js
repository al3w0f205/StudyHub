"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function QuizClient({ questions, categoryName, careerName }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const progress = ((current + 1) / total) * 100;

  function handleAnswer(index) {
    if (selected !== null) return;
    setSelected(index);
    setAnswered((a) => a + 1);
    if (index === q.correctIndex) setScore((s) => s + 1);
    setShowExplanation(true);
  }

  function nextQuestion() {
    if (current + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "2rem 0" }}>
        <div className="solid-card animate-fade-in" style={{ padding: "2.5rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📖"}</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Cuestionario Finalizado</h2>
          <div className="stat-value" style={{ fontSize: "3rem", margin: "1rem 0" }}>{pct}%</div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
            {score} de {total} respuestas correctas
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: "2rem" }}>
            {pct >= 70 ? "¡Excelente trabajo! Sigue así." : pct >= 50 ? "Buen intento. Repasa los temas difíciles." : "Necesitas más práctica. ¡No te rindas!"}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={restart} className="btn btn-primary">Repetir</button>
            <Link href="/quiz" className="btn btn-secondary">Otro Cuestionario</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginBottom: "0.5rem" }}>
          {careerName} → {categoryName}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Pregunta {current + 1} de {total}</span>
          <span className="badge badge-primary">{score}/{answered} correctas</span>
        </div>
        <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--gradient-primary)", borderRadius: "var(--radius-full)", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Question */}
      <div className="solid-card animate-fade-in" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.6 }}>{q.text}</p>
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
        {q.options.map((opt, i) => {
          let bg = "var(--bg-card)";
          let border = "var(--border-default)";
          let color = "var(--text-primary)";

          if (selected !== null) {
            if (i === q.correctIndex) {
              bg = "rgba(16,185,129,0.1)";
              border = "rgba(16,185,129,0.4)";
              color = "var(--accent-400)";
            } else if (i === selected && i !== q.correctIndex) {
              bg = "rgba(244,63,94,0.1)";
              border = "rgba(244,63,94,0.4)";
              color = "var(--danger-400)";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              style={{
                padding: "0.875rem 1rem",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                cursor: selected !== null ? "default" : "pointer",
                color,
                fontSize: "0.875rem",
                fontWeight: 500,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                opacity: selected !== null && i !== selected && i !== q.correctIndex ? 0.5 : 1,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "var(--radius-full)", background: "var(--glass-bg)", marginRight: "0.75rem", fontSize: "0.75rem", fontWeight: 700 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {q.hint && selected === null && (
        <button onClick={() => setShowHint(!showHint)} className="btn btn-ghost btn-sm" style={{ marginBottom: "0.75rem" }}>
          💡 {showHint ? "Ocultar Pista" : "Ver Pista"}
        </button>
      )}
      {showHint && !showExplanation && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem", marginBottom: "1rem", borderColor: "rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.03)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--warning-400)" }}>💡 {q.hint}</p>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && q.explanation && (
        <div className="solid-card animate-fade-in" style={{ padding: "1rem", marginBottom: "1rem", borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.03)" }}>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary-400)", marginBottom: "0.25rem" }}>📖 Justificación</p>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{q.explanation}</p>
        </div>
      )}

      {/* Next */}
      {selected !== null && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={nextQuestion} className="btn btn-primary animate-fade-in">
            {current + 1 >= total ? "Ver Resultados" : "Siguiente →"}
          </button>
        </div>
      )}
    </div>
  );
}
