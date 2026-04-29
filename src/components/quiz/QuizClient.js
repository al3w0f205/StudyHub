"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import MathText from "@/components/ui/MathText";
import { useToast } from "@/components/ui/Toast";
import { Edit2, Save, Trash2, Layout, Layers, GraduationCap, Clock, Monitor, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizClient({ 
  questions: initialQuestions, 
  theory, 
  categoryName, 
  careerName, 
  careers, 
  currentCareerId, 
  categoryId, 
  isOfflineMode = false,
  totalQuestionsInCategory = 0,
  initialCompletedCount = 0,
  isAdmin = false
}) {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState(initialQuestions);

  // State
  const [view, setView] = useState(questions.length === 0 ? "theory" : "quiz"); // "quiz", "theory", "flashcards"
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState([]); // [{ questionId, isCorrect }]
  const [completedCount, setCompletedCount] = useState(initialCompletedCount);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Admin Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Tools
  const [isZenMode, setIsZenMode] = useState(false);
  const [isTimePressure, setIsTimePressure] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Flashcards state
  const [isFlipped, setIsFlipped] = useState(false);

  // Sidebar
  const [selectedCareerId, setSelectedCareerId] = useState(currentCareerId || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats from DB
  const [categoryProgress, setCategoryProgress] = useState({});

  useEffect(() => {
    if (isOfflineMode) return;
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
  const q = questions[current] || null;
  
  // Progress calculation based on the whole category
  const effectiveTotal = totalQuestionsInCategory || total;
  const currentProgressCount = completedCount + (selected !== null && selected === q?.correctIndex ? 1 : 0);
  const progress = effectiveTotal > 0 ? (currentProgressCount / effectiveTotal) * 100 : 0;

  const saveProgress = useCallback(async (payload) => {
    if (isOfflineMode) {
      // Manual offline mode saves only to local
      const key = `offline_progress_${categoryId}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing));
      return true;
    }
    
    try {
      const body = payload.type === "single"
        ? { categoryId, questionId: payload.questionId, selectedIndex: payload.selectedIndex }
        : { categoryId, score: payload.score, results: payload.results || history };

      const res = await fetch("/api/quiz-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save");
      return true;
    } catch (e) {
      console.error("Failed to save progress, queuing for sync:", e);
      // Queue for background sync
      const queue = JSON.parse(localStorage.getItem("studyhub_sync_queue") || "[]");
      queue.push({ ...payload, categoryId, timestamp: new Date().getTime() });
      localStorage.setItem("studyhub_sync_queue", JSON.stringify(queue));
      return false;
    }
  }, [categoryId, history, isOfflineMode]);

  // Background Sync Effect
  useEffect(() => {
    if (typeof window === "undefined" || isOfflineMode) return;

    const syncProgress = async () => {
      const queue = JSON.parse(localStorage.getItem("studyhub_sync_queue") || "[]");
      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} items...`);
      let successCount = 0;

      for (const item of queue) {
        try {
          const res = await fetch("/api/quiz-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
          if (res.ok) successCount++;
        } catch (e) {
          break; // Stop if still offline
        }
      }

      if (successCount > 0) {
        const remaining = queue.slice(successCount);
        localStorage.setItem("studyhub_sync_queue", JSON.stringify(remaining));
        addToast(`Sincronizadas ${successCount} respuestas guardadas offline 🔄`, "info");
      }
    };

    window.addEventListener("online", syncProgress);
    // Try once on mount
    if (navigator.onLine) syncProgress();

    return () => window.removeEventListener("online", syncProgress);
  }, [addToast, isOfflineMode]);


  const handleAnswer = useCallback((index) => {
    if (!q) return;
    if (selected !== null) return;
    setSelected(index);
    setAnswered((a) => a + 1);

    const isCorrect = index === q.correctIndex;
    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
      addToast("¡Respuesta correcta! 🚀", "success", 2000);
    } else {
      addToast("Respuesta incorrecta. ¡Sigue intentando!", "warning", 2000);
    }

    setHistory(prev => [...prev, { questionId: q.id, isCorrect }]);

    // Save immediately
    saveProgress({ type: "single", questionId: q.id, selectedIndex: index });

    if (!isExamMode) {
      setShowExplanation(true);
    }
  }, [q, selected, isExamMode, saveProgress, addToast]);

  const handleSaveEdit = async () => {
    if (!editedQuestion || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedQuestion),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuestions(prev => prev.map(qq => qq.id === updated.id ? updated : qq));
        setIsEditing(false);
        addToast("Pregunta actualizada correctamente ✨", "success");
      } else {
        addToast("Error al actualizar la pregunta", "error");
      }
    } catch (e) {
      addToast("Error de conexión", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTimePressure && !selected && !finished && view === "quiz") {
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
  }, [isTimePressure, selected, finished, current, handleAnswer, view]);

  async function nextQuestion() {
    if (isSavingFinal) return;
    if (selected === q?.correctIndex) {
      setCompletedCount(prev => prev + 1);
    }

    if (current + 1 >= total) {
      // Final overall score update
      const finalScore = totalQuestionsInCategory > 0 
        ? Math.round(((completedCount + (selected === q?.correctIndex ? 1 : 0)) / totalQuestionsInCategory) * 100)
        : 100;
      setIsSavingFinal(true);
      await saveProgress({
        type: "final",
        score: Math.max(0, Math.min(100, finalScore)),
      });
      setIsSavingFinal(false);
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setIsFlipped(false);
    setTimeLeft(30);
  }

  function startExamMode() {
    if (total === 0) return;
    setIsExamMode(true);
    setIsTimePressure(true);
    setIsZenMode(true);
    restart();
    setView("quiz");
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setIsFlipped(false);
    setScore(0);
    setAnswered(0);
    setFinished(false);
    setHistory([]);
    setTimeLeft(30);
  }

  async function resetProgress() {
    if (!window.confirm("¿Estás seguro de que quieres reiniciar tu progreso en este módulo? Se borrarán todas tus respuestas guardadas.")) return;
    
    setIsResetting(true);
    try {
      const res = await fetch(`/api/quiz-progress?categoryId=${categoryId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        addToast("Progreso reiniciado. ¡A por ello de nuevo! 🔄", "info");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        addToast("Error al reiniciar progreso.", "error");
      }
    } catch (e) {
      addToast("Error de conexión.", "error");
    } finally {
      setIsResetting(false);
    }
  }

  async function reportError(customReason) {
    if (!q || isReporting) return;
    const reason = String(customReason || "").trim();
    if (reason.length < 8) {
      alert("Describe un poco más el error (mínimo 8 caracteres).");
      return;
    }

    setIsReporting(true);
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, reason }),
      });
      if (res.ok) {
        alert("Reporte enviado. ¡Gracias por ayudarnos a mejorar!");
        setReportReason("");
        setReportOpen(false);
      } else {
        const payload = await res.json().catch(() => ({}));
        alert(payload?.error || "Error al enviar el reporte. Inténtalo de nuevo.");
      }
    } catch (e) {
      alert("Error de conexión.");
    } finally {
      setIsReporting(false);
    }
  }

  function saveOffline() {
    const offlineData = {
      id: categoryId,
      name: categoryName,
      career: careerName,
      questions,
      theory,
      savedAt: new Date().toISOString()
    };
    
    try {
      const existing = JSON.parse(localStorage.getItem("studyhub_offline") || "[]");
      const filtered = existing.filter(item => item.id !== categoryId);
      filtered.push(offlineData);
      localStorage.setItem("studyhub_offline", JSON.stringify(filtered));
      alert("¡Materia guardada para estudio offline! Podrás acceder desde el menú principal.");
    } catch (e) {
      alert("Error al guardar: es posible que el contenido sea demasiado grande para tu navegador.");
    }
  }

  // Get categories for selected career
  const selectedCareer = careers?.find(c => c.id === selectedCareerId);
  const filteredCategories = selectedCareer?.categories || [];

  // Final Results Screen
  if (finished && total > 0) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="quiz-results-container">
        <div className="solid-card animate-fade-in quiz-results-card">
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{pct >= 70 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {isExamMode ? "Simulacro Completado" : "Cuestionario Finalizado"}
          </h2>
          <div className="stat-value" style={{ fontSize: "3.5rem", margin: "1rem 0", color: pct >= 70 ? "var(--success-400)" : pct >= 50 ? "var(--warning-400)" : "var(--danger-400)" }}>{pct}%</div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "1rem" }}>
            <strong style={{ color: "var(--text-primary)" }}>{score}</strong> correctas de {total}
          </p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginBottom: "2rem" }}>
            {pct >= 70 ? "¡Excelente dominio del tema!" : pct >= 50 ? "Buen intento. Sigue practicando." : "Necesitas repasar estos conceptos."}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setIsExamMode(false); restart(); }} className="btn btn-primary">Repetir</button>
            <Link href="/quiz" className="btn btn-secondary">Volver al Menú</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`quiz-layout ${isZenMode ? 'zen-mode' : ''}`}>
      
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

          {/* Theory & Modes Access */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 className="quiz-sidebar-title">Modos de Estudio</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button 
                onClick={() => { setView("quiz"); restart(); }}
                className={`btn btn-sm ${view === "quiz" && !isExamMode ? "btn-primary" : "btn-secondary"}`}
                disabled={total === 0}
                style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
              >
                ✍️ Cuestionario
              </button>
              <button 
                onClick={() => { setView("flashcards"); restart(); }}
                className={`btn btn-sm ${view === "flashcards" ? "btn-primary" : "btn-secondary"}`}
                disabled={total === 0}
                style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
              >
                🃏 Flashcards
              </button>
              {theory && (
                <button 
                  onClick={() => setView("theory")}
                  className={`btn btn-sm ${view === "theory" ? "btn-primary" : "btn-secondary"}`}
                  style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
                >
                  📚 Estudiar Teoría
                </button>
              )}
              <button 
                onClick={startExamMode}
                className="btn btn-sm btn-secondary"
                disabled={total === 0}
                style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem", border: "1px solid var(--danger-400)", color: "var(--danger-400)" }}
              >
                ⏱️ Simulacro Examen
              </button>
            </div>
          </div>

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

              <button 
                onClick={resetProgress} 
                className="quiz-tool-label" 
                disabled={isResetting}
                style={{ 
                  background: "transparent", 
                  border: "1px solid rgba(244, 63, 94, 0.2)", 
                  cursor: "pointer", 
                  color: "var(--danger-400)", 
                  width: "100%", 
                  textAlign: "left", 
                  fontFamily: "inherit",
                  marginTop: "0.5rem"
                }}
              >
                <span>{isResetting ? "⌛ Reiniciando..." : "🗑️ Reiniciar Progreso"}</span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Main Quiz Area */}
      <div className="quiz-main" style={{ maxWidth: isZenMode || view === "theory" || view === "flashcards" ? 850 : "none", margin: isZenMode || view === "theory" || view === "flashcards" ? "0 auto" : "0", width: "100%" }}>
        
        {view === "theory" ? (
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
        ) : view === "flashcards" ? (
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
        ) : (
          <>
            {/* Header */}
        <div className="quiz-header quiz-topbar">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/quiz" className="quiz-breadcrumb" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}>
                🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span> <strong style={{ color: "var(--accent-400)" }}>{categoryName}</strong>
              </Link>
              {isOfflineMode && <span style={{ background: "var(--success-400)", color: "black", fontSize: "0.625rem", fontWeight: 800, padding: "0.125rem 0.375rem", borderRadius: "4px", textTransform: "uppercase" }}>Offline</span>}
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
              <button onClick={() => { setIsZenMode(false); setIsExamMode(false); }} className="btn btn-sm btn-secondary">Salir Modo Enfoque</button>
            )}
            {isAdmin && !isOfflineMode && !isExamMode && (
              <button 
                onClick={() => { setEditedQuestion({...q}); setIsEditing(true); }} 
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

        {/* Progress Bar */}
        <div style={{ height: 3, background: "var(--bg-card)", borderRadius: 2, overflow: "hidden", marginBottom: "1.5rem" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: isExamMode ? "var(--danger-400)" : "var(--accent-400)", transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </div>

        {/* Question Card */}
        {total === 0 ? (
          <div className="solid-card animate-fade-in" style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✨</div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>¡Módulo Completado!</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>Has respondido correctamente todas las preguntas de esta categoría.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button onClick={resetProgress} className="btn btn-primary">Reiniciar para Practicar</button>
              <Link href="/quiz" className="btn btn-secondary">Ir a otra Materia</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="solid-card animate-fade-in quiz-question-card">
              <MathText className="quiz-question-text">{q.text}</MathText>
            </div>
          </>
        )}

        {/* Options */}
        {total > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {q?.options?.map((opt, i) => {
            let bg = "var(--bg-card)";
            let border = "var(--border-default)";
            let color = "var(--text-primary)";
            let icon = String.fromCharCode(65 + i);

            if (selected !== null) {
              if (i === q.correctIndex) {
                // In exam mode, we don't show the correct answer until the end? 
                // Usually yes, but the user said "se supone q esta como las opciones del cuestionario mismo"
                // I'll show it ONLY if not isExamMode, or if selected.
                // Actually, let's follow the user's hint: they want it like a simulator.
                // In a simulator, you don't see if you were right until the end.
                if (!isExamMode) {
                  bg = "rgba(16, 185, 129, 0.08)";
                  border = "rgba(16, 185, 129, 0.5)";
                  color = "var(--success-400)";
                  icon = "✓";
                } else {
                  // Exam mode: just highlight selection
                  if (i === selected) {
                    bg = "rgba(99, 102, 241, 0.1)";
                    border = "var(--primary-400)";
                    color = "var(--primary-400)";
                  }
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
                className={`quiz-option ${selected === null ? "quiz-option-active" : ""}`}
                style={{
                  background: bg,
                  borderColor: border,
                  color: color,
                  opacity: selected !== null && i !== selected && (isExamMode || i !== q.correctIndex) ? 0.4 : 1,
                }}
              >
                <div className="quiz-option-icon" style={{
                  background: selected !== null && (i === q.correctIndex || i === selected) && !isExamMode ? "transparent" : "var(--glass-bg)",
                  border: selected !== null && (i === q.correctIndex || i === selected) && !isExamMode ? `1px solid ${color}` : "none",
                }}>
                  {icon}
                </div>
                <MathText className="quiz-option-text">{opt}</MathText>
              </button>
            );
          })}
        </div>
        )}

        {/* Hint & Actions */}
        {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div className="quiz-actions-row" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {q.hint && selected === null && !isExamMode && (
              <button onClick={() => setShowHint(!showHint)} className="btn btn-ghost" style={{ color: "var(--warning-400)", fontSize: "0.875rem" }}>
                💡 {showHint ? "Ocultar Pista" : "Ver Pista"}
              </button>
            )}
            <button onClick={() => setReportOpen((prev) => !prev)} className="btn btn-ghost" style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem", opacity: 0.8 }}>
              🚩 Reportar Error
            </button>
          </div>
          
          {selected !== null && (
            <button onClick={nextQuestion} className="btn btn-primary animate-fade-in quiz-next-btn" disabled={isSavingFinal}>
              {isSavingFinal ? "Guardando..." : current + 1 >= total ? "Ver Resultados 🏆" : "Siguiente →"}
            </button>
          )}
        </div>
        )}

        {total > 0 && reportOpen && (
          <div className="solid-card animate-fade-in" style={{ padding: "0.875rem", marginBottom: "0.75rem", border: "1px solid rgba(244,63,94,0.25)" }}>
            <label htmlFor="report-reason" style={{ display: "block", fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              ¿Qué problema encontraste?
            </label>
            <textarea
              id="report-reason"
              className="input textarea"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Ej: la opción correcta no coincide con la explicación, hay error de redacción o fórmula."
              style={{ minHeight: 86, marginBottom: "0.625rem" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }>Mínimo 8 caracteres.</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReportOpen(false)} disabled={isReporting}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => reportError(reportReason)} disabled={isReporting}>
                  {isReporting ? "Enviando..." : "Enviar Reporte"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hint Box */}
        {total > 0 && showHint && !showExplanation && !isExamMode && (
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
        {total > 0 && showExplanation && q?.explanation && !isExamMode && (
          <div className="solid-card animate-fade-in" style={{ padding: "1.25rem", borderLeft: "3px solid var(--accent-400)", background: "rgba(34,211,238,0.05)", marginTop: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-400)", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Justificación</p>
            <MathText className="quiz-explanation-text">{q.explanation}</MathText>
          </div>
        )}
          </>
        )}
      </div>

      {!isZenMode && (
        <nav className="quiz-mobile-bottom-nav" aria-label="Navegación rápida móvil">
          <Link href="/quiz" className="quiz-mobile-bottom-link">
            <span>🧭</span>
            <span>Menú</span>
          </Link>
          <Link href="/quiz/repaso" className="quiz-mobile-bottom-link">
            <span>🧠</span>
            <span>Repaso</span>
          </Link>
          <Link href="/badges" className="quiz-mobile-bottom-link">
            <span>🏅</span>
            <span>Logros</span>
          </Link>
          <button
            type="button"
            className="quiz-mobile-bottom-link quiz-mobile-bottom-link-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <span>{sidebarOpen ? "✕" : "☰"}</span>
            <span>{sidebarOpen ? "Cerrar" : "Panel"}</span>
          </button>
        </nav>
      )}

      {/* ADMIN IN-SITU EDITOR MODAL */}
      <AnimatePresence>
        {isEditing && editedQuestion && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="solid-card" 
              style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", border: "1px solid var(--primary-400)" }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.5rem", color: "var(--primary-400)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Edit2 size={20} /> Editor de Pregunta (Modo Admin)
              </h2>
              
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Pregunta</label>
                  <textarea 
                    className="input" 
                    value={editedQuestion.text} 
                    onChange={e => setEditedQuestion({...editedQuestion, text: e.target.value})} 
                    style={{ minHeight: "80px", marginTop: "0.25rem" }}
                  />
                </div>

                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Opciones</label>
                  {editedQuestion.options.map((opt, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input 
                        type="radio" 
                        name="correct" 
                        checked={editedQuestion.correctIndex === i} 
                        onChange={() => setEditedQuestion({...editedQuestion, correctIndex: i})} 
                      />
                      <input 
                        className="input" 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...editedQuestion.options];
                          newOpts[i] = e.target.value;
                          setEditedQuestion({...editedQuestion, options: newOpts});
                        }} 
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Pista (Hint)</label>
                  <input 
                    className="input" 
                    value={editedQuestion.hint || ""} 
                    onChange={e => setEditedQuestion({...editedQuestion, hint: e.target.value})} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>Explicación</label>
                  <textarea 
                    className="input" 
                    value={editedQuestion.explanation || ""} 
                    onChange={e => setEditedQuestion({...editedQuestion, explanation: e.target.value})} 
                    style={{ minHeight: "80px", marginTop: "0.25rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button 
                  onClick={handleSaveEdit} 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? "Guardando..." : <><Save size={18} /> Guardar Cambios</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

