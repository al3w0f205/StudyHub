"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MathText from "@/components/ui/MathText";

export default function QuizClient({ questions, theory, categoryName, careerName, careers, currentCareerId, categoryId }) {
  // State
  const [view, setView] = useState("quiz"); // "quiz" or "theory"
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  
  // Tools
  const [isZenMode, setIsZenMode] = useState(false);
  const [isTimePressure, setIsTimePressure] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Sidebar
  const [selectedCareerId, setSelectedCareerId] = useState(currentCareerId || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats from DB
  const [categoryProgress, setCategoryProgress] = useState({});

  useEffect(() => {
    // Load progress from API
    fetch("/api/quiz-progress")
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        const mapped = {};
        for (const [key, val] of Object.entries(data)) {
          mapped[key] = val.score || 0;
        }
        setCategoryProgress(mapped);
      })
      .catch(() => {});
  }, []);

  const total = questions.length;
  const q = questions[current];
  const progress = ((current + 1) / total) * 100;

  const saveProgress = useCallback(async (newScore) => {
    const pct = Math.round((newScore / total) * 100);
    setCategoryProgress(prev => ({ ...prev, [categoryId]: pct }));
    
    try {
      await fetch("/api/quiz-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, score: pct }),
      });
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }, [categoryId, total]);


  // Timer logic
  useEffect(() => {
    if (isTimePressure && !selected && !finished) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(-1); // Timeout = wrong answer
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTimePressure, selected, finished, current]);

  function handleAnswer(index) {
    if (selected !== null) return;
    setSelected(index);
    setAnswered((a) => a + 1);
    
    let newScore = score;
    if (index === q.correctIndex) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    setShowExplanation(true);
  }

  function nextQuestion() {
    if (current + 1 >= total) {
      setFinished(true);
      saveProgress(score + (selected === q.correctIndex ? 1 : 0));
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setTimeLeft(30);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setScore(0);
    setAnswered(0);
    setFinished(false);
    setTimeLeft(30);
  }

  // Get categories for selected career
  const selectedCareer = careers?.find(c => c.id === selectedCareerId);
  const filteredCategories = selectedCareer?.categories || [];

  // Final Results Screen
  if (finished) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="quiz-results-container">
        <div className="solid-card animate-fade-in quiz-results-card">
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Cuestionario Finalizado</h2>
          <div className="stat-value" style={{ fontSize: "3.5rem", margin: "1rem 0", color: pct >= 70 ? "var(--success-400)" : pct >= 50 ? "var(--warning-400)" : "var(--danger-400)" }}>{pct}%</div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "1rem" }}>
            <strong style={{ color: "var(--text-primary)" }}>{score}</strong> correctas de {total}
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: "2rem" }}>
            {pct >= 70 ? "¡Excelente dominio del tema!" : pct >= 50 ? "Buen intento. Sigue practicando." : "Necesitas repasar estos conceptos."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={restart} className="btn btn-primary">Repetir</button>
            <Link href="/quiz" className="btn btn-secondary">Volver al Menú</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`quiz-layout ${isZenMode ? 'zen-mode' : ''}`}>
      
      {/* Mobile sidebar toggle */}
      {!isZenMode && (
        <button 
          className="quiz-mobile-toggle btn btn-secondary btn-sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕ Cerrar" : "☰ Navegación"}
        </button>
      )}

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="quiz-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      {!isZenMode && (
        <div className={`solid-card quiz-sidebar ${sidebarOpen ? 'quiz-sidebar-open' : ''}`}>
          
          {/* Main Menu Button */}
          <div style={{ marginBottom: "1.5rem" }}>
            <Link href="/quiz" className="btn btn-secondary" style={{ width: "100%", justifyContent: "flex-start", gap: "0.75rem", fontSize: "0.8125rem" }}>
              🏠 Volver al Menú
            </Link>
          </div>

          {/* Career Selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 className="quiz-sidebar-title">Carrera</h3>
            <select
              className="select"
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
            >
              {careers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Categories for selected career */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 className="quiz-sidebar-title">Categorías</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {filteredCategories.map(c => (
                <Link
                  key={c.id}
                  href={`/quiz/${c.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className="quiz-cat-link"
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8125rem",
                    fontWeight: c.id === categoryId ? 600 : 400,
                    color: c.id === categoryId ? "var(--accent-400)" : "var(--text-secondary)",
                    background: c.id === categoryId ? "rgba(45,212,191,0.08)" : "transparent",
                    border: c.id === categoryId ? "1px solid rgba(45,212,191,0.2)" : "1px solid transparent",
                    textDecoration: "none",
                    display: "block",
                    transition: "all 0.15s ease",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Progress for this career's categories */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 className="quiz-sidebar-title">Dominio por Área</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredCategories.slice(0, 6).map(c => {
                const p = categoryProgress[c.id] || 0;
                return (
                  <div key={c.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "0.5rem" }}>{c.name}</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)", flexShrink: 0 }}>{p}%</span>
                    </div>
                    <div style={{ height: 3, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: p >= 70 ? "var(--success-400)" : p >= 40 ? "var(--warning-400)" : "var(--text-tertiary)", borderRadius: 2, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theory Access */}
          {theory && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 className="quiz-sidebar-title">Material</h3>
              <button 
                onClick={() => setView(view === "quiz" ? "theory" : "quiz")}
                className={`btn btn-sm ${view === "theory" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: "center", display: "flex", gap: "0.5rem" }}
              >
                {view === "quiz" ? "📚 Estudiar Teoría" : "✍️ Volver al Quiz"}
              </button>
            </div>
          )}

          {/* Tools */}
          <div>
            <h3 className="quiz-sidebar-title">Herramientas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              
              <label className="quiz-tool-label">
                <span>⏱️ Presión de Tiempo</span>
                <input type="checkbox" checked={isTimePressure} onChange={() => setIsTimePressure(!isTimePressure)} style={{ accentColor: "var(--accent-400)" }} />
              </label>

              <label className="quiz-tool-label">
                <span>👁️ Modo Enfoque</span>
                <input type="checkbox" checked={isZenMode} onChange={() => setIsZenMode(!isZenMode)} style={{ accentColor: "var(--accent-400)" }} />
              </label>

              <button onClick={() => window.location.reload()} className="quiz-tool-label" style={{ background: "transparent", border: "1px solid var(--border-default)", cursor: "pointer", color: "var(--text-primary)", width: "100%", textAlign: "left", fontFamily: "inherit" }}>
                <span>🔀 Mezclar Todo</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Main Quiz Area */}
      <div className="quiz-main" style={{ maxWidth: isZenMode || view === "theory" ? 850 : "none", margin: isZenMode || view === "theory" ? "0 auto" : "0", width: "100%" }}>
        
        {view === "theory" ? (
          <div className="animate-fade-in">
             <div className="quiz-header" style={{ marginBottom: "1.5rem" }}>
              <div style={{ minWidth: 0 }}>
                <Link href="/quiz" className="quiz-breadcrumb" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                  🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span> <strong style={{ color: "var(--accent-400)" }}>{categoryName}</strong>
                </Link>

                <h1 className="quiz-question-number">Material de Estudio</h1>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setView("quiz")} className="btn btn-primary btn-sm">Empezar Quiz →</button>
                <Link href="/quiz" className="btn btn-sm btn-secondary" style={{ border: "1px solid var(--border-default)", fontWeight: 700 }}>
                  SALIR ✕
                </Link>
              </div>
            </div>

            
            <div className="solid-card" style={{ padding: "2rem", lineHeight: 1.8 }}>
              <MathText className="theory-content">{theory}</MathText>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="quiz-header">
          <div style={{ minWidth: 0 }}>
                <Link href="/quiz" className="quiz-breadcrumb" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                  🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span> <strong style={{ color: "var(--accent-400)" }}>{categoryName}</strong>
                </Link>

            <h1 className="quiz-question-number">Pregunta {current + 1} <span style={{ color: "var(--text-tertiary)", fontSize: "1rem", fontWeight: 500 }}>/ {total}</span></h1>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
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
              <button onClick={() => setIsZenMode(false)} className="btn btn-sm btn-secondary">Salir Zen</button>
            )}
            <Link href="/quiz" className="btn btn-sm btn-secondary" style={{ border: "1px solid var(--border-default)", fontWeight: 700 }}>
              SALIR ✕
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 3, background: "var(--bg-card)", borderRadius: 2, overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-400)", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>

        {/* Question Card */}
        <div className="solid-card animate-fade-in quiz-question-card">
          <MathText className="quiz-question-text">{q.text}</MathText>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {q.options.map((opt, i) => {
            let bg = "var(--bg-card)";
            let border = "var(--border-default)";
            let color = "var(--text-primary)";
            let icon = String.fromCharCode(65 + i);

            if (selected !== null) {
              if (i === q.correctIndex) {
                bg = "rgba(16, 185, 129, 0.08)";
                border = "rgba(16, 185, 129, 0.5)";
                color = "var(--success-400)";
                icon = "✓";
              } else if (i === selected && i !== q.correctIndex) {
                bg = "rgba(244, 63, 94, 0.08)";
                border = "rgba(244, 63, 94, 0.5)";
                color = "var(--danger-400)";
                icon = "✗";
              }
            } else if (selected === -1 && i === q.correctIndex) {
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
                className={`quiz-option ${selected === null ? "quiz-option-active" : ""}`}
                style={{
                  background: bg,
                  borderColor: border,
                  color: color,
                  opacity: selected !== null && i !== selected && i !== q.correctIndex ? 0.4 : 1,
                }}
              >
                <div className="quiz-option-icon" style={{
                  background: selected !== null && (i === q.correctIndex || i === selected) ? "transparent" : "var(--glass-bg)",
                  border: selected !== null && (i === q.correctIndex || i === selected) ? `1px solid ${color}` : "none",
                }}>
                  {icon}
                </div>
                <MathText className="quiz-option-text">{opt}</MathText>
              </button>
            );
          })}
        </div>

        {/* Hint & Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            {q.hint && selected === null && (
              <button onClick={() => setShowHint(!showHint)} className="btn btn-ghost" style={{ color: "var(--warning-400)", fontSize: "0.875rem" }}>
                💡 {showHint ? "Ocultar Pista" : "Ver Pista"}
              </button>
            )}
          </div>
          
          {selected !== null && (
            <button onClick={nextQuestion} className="btn btn-primary animate-fade-in quiz-next-btn">
              {current + 1 >= total ? "Ver Resultados 🏆" : "Siguiente →"}
            </button>
          )}
        </div>

        {/* Hint Box */}
        {showHint && !showExplanation && (
          <div className="solid-card animate-fade-in" style={{ padding: "1rem", borderLeft: "3px solid var(--warning-400)", background: "rgba(245,158,11,0.05)" }}>
            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <span>💡</span>
              <div>
                <strong>Pista:</strong>
                <MathText>{q.hint}</MathText>
              </div>
            </div>
          </div>
        )}

        {/* Explanation Box */}
        {showExplanation && q.explanation && (
          <div className="solid-card animate-fade-in" style={{ padding: "1.25rem", borderLeft: "3px solid var(--accent-400)", background: "rgba(34,211,238,0.05)", marginTop: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-400)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Justificación</p>
            <MathText className="quiz-explanation-text">{q.explanation}</MathText>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
