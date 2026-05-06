// QuizQuestion — Renderiza pregunta y opciones de respuesta.
// Maneja estados visuales: sin responder, correcto (verde), incorrecto (rojo).
// En modo examen, las respuestas se marcan en azul sin revelar la correcta.
// Soporta LaTeX/Markdown en preguntas y opciones vía MathText.
"use client";
import dynamic from "next/dynamic";
const MathText = dynamic(() => import("@/components/ui/MathText"));

export default function QuizQuestion({
  q,
  selected,
  handleAnswer,
  isExamMode,
}) {
  if (!q) return null;

  return (
    <>
      <div className="solid-card animate-fade-in quiz-question-card">
        <MathText className="quiz-question-text">{q.text}</MathText>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {q.options?.map((opt, i) => {
          let bg = "var(--bg-card)";
          let border = "var(--border-default)";
          let color = "var(--text-primary)";
          let icon = String.fromCharCode(65 + i);

          if (selected !== null) {
            if (i === q.correctIndex) {
              if (!isExamMode) {
                bg = "rgba(16, 185, 129, 0.08)";
                border = "rgba(16, 185, 129, 0.5)";
                color = "var(--success-400)";
                icon = "✓";
              } else if (i === selected) {
                bg = "rgba(99, 102, 241, 0.1)";
                border = "var(--primary-400)";
                color = "var(--primary-400)";
              }
            } else if (i === selected && i !== q.correctIndex) {
              if (!isExamMode) {
                bg = "rgba(244, 63, 94, 0.08)";
                border = "rgba(244, 63, 94, 0.5)";
                color = "var(--danger-400)";
                icon = "✗";
              } else {
                bg = "rgba(99, 102, 241, 0.1)";
                border = "var(--primary-400)";
                color = "var(--primary-400)";
              }
            }
          } else if (selected === -1 && i === q.correctIndex && !isExamMode) {
            bg = "rgba(16, 185, 129, 0.08)";
            border = "rgba(16, 185, 129, 0.5)";
            color = "var(--success-400)";
            icon = "✓";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={selected !== null}
              className="quiz-option"
              style={{
                background: bg,
                borderColor: border,
                color: color,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                fontSize: "1rem",
                cursor: selected === null ? "pointer" : "default",
                transition: "all 0.2s ease",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: selected !== null && (i === selected || i === q.correctIndex) ? color : "var(--bg-secondary)",
                  color: selected !== null && (i === selected || i === q.correctIndex) ? "black" : "var(--text-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {icon}
              </span>
              <div style={{ flex: 1 }}>
                <MathText>{opt}</MathText>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
