// FlashcardsView — Modo de estudio con tarjetas flip 3D.
// Front: texto de la pregunta. Back: respuesta correcta + justificación.
// Usa CSS transform: rotateY(180deg) con preserve-3d para el efecto 3D.
// Navegación: anterior/siguiente, click para voltear.
"use client";
import MathText from "@/components/ui/MathText";

export default function FlashcardsView({
  current,
  total,
  q,
  isFlipped,
  setIsFlipped,
  setCurrent,
  nextQuestion,
}) {
  if (!q) return null;

  return (
    <div className="animate-fade-in" style={{ textAlign: "center" }}>
      <div className="quiz-header" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
        <div style={{ minWidth: 0 }}>
          <div className="quiz-breadcrumb">Modo Flashcards</div>
          <h1 className="quiz-question-number">Tarjeta {current + 1} de {total}</h1>
        </div>
      </div>

      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
        <div className="flashcard-inner">
          {/* Front */}
          <div className="flashcard-front solid-card">
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: "1rem", fontWeight: 700 }}>Pregunta</div>
            <MathText className="quiz-question-text">{q.text}</MathText>
            <div style={{ marginTop: "2rem", color: "var(--primary-400)", fontSize: "0.875rem", fontWeight: 600 }}>Click para voltear 🔄</div>
          </div>
          {/* Back */}
          <div className="flashcard-back solid-card">
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--success-400)", marginBottom: "1rem", fontWeight: 700 }}>Respuesta Correcta</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {q.options[q.correctIndex]}
            </div>
            {q.explanation && (
              <div style={{ textAlign: "left", fontSize: "0.9375rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-default)", paddingTop: "1rem" }}>
                <strong style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Justificación:</strong>
                <MathText>{q.explanation}</MathText>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quiz-flashcard-actions" style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
         <button 
          onClick={() => {
            if (current > 0) {
              setCurrent(current - 1);
              setIsFlipped(false);
            }
          }} 
          className="btn btn-secondary" 
          disabled={current === 0}
        >
          ← Anterior
        </button>
        <button onClick={nextQuestion} className="btn btn-primary">
          {current + 1 >= total ? "Finalizar" : "Siguiente →"}
        </button>
      </div>

      <style jsx>{`
        .flashcard {
          perspective: 1000px;
          width: 100%;
          max-width: 500px;
          height: 400px;
          margin: 0 auto;
          cursor: pointer;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }
        .flashcard-back {
          transform: rotateY(180deg);
          background: var(--bg-card-hover);
        }
      `}</style>
    </div>
  );
}
