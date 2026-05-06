"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";
import React from "react";

// Sub-componentes del motor de quiz (client-parts/)
import QuizHeader from "./client-parts/QuizHeader";
import QuizSidebar from "./client-parts/QuizSidebar";
import QuizQuestion from "./client-parts/QuizQuestion";
import QuizResults from "./client-parts/QuizResults";
import FlashcardsView from "./client-parts/FlashcardsView";
import TheoryView from "./client-parts/TheoryView";
import AdminQuestionEditor from "./client-parts/AdminQuestionEditor";

const MathText = dynamic(() => import("@/components/ui/MathText"));

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  hint?: string | null;
  explanation?: string | null;
}

interface Career {
  id: string;
  name: string;
  slug: string;
  categories: { id: string; name: string }[];
}

interface QuizClientProps {
  questions: Question[];
  theory?: string | null;
  categoryName: string;
  careerName: string;
  careers?: Career[];
  currentCareerId?: string;
  categoryId: string;
  totalQuestionsInCategory?: number;
  initialCompletedCount?: number;
  isAdmin?: boolean;
}

export default function QuizClient({
  questions: initialQuestions,
  theory,
  categoryName,
  careerName,
  careers,
  currentCareerId,
  categoryId,
  totalQuestionsInCategory = 0,
  initialCompletedCount = 0,
  isAdmin = false,
}: QuizClientProps) {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState(initialQuestions);

  // State
  const [view, setView] = useState<"quiz" | "flashcards" | "theory">(
    questions.length === 0 ? "theory" : "quiz"
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [completedCount, setCompletedCount] = useState(initialCompletedCount);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Admin Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);
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

  const total = questions.length;
  const q = questions[current] || null;

  // Progress calculation
  const effectiveTotal = totalQuestionsInCategory || total;
  const currentProgressCount =
    completedCount + (selected !== null && selected === q?.correctIndex ? 1 : 0);
  const progress = effectiveTotal > 0 ? (currentProgressCount / effectiveTotal) * 100 : 0;

  const saveProgress = useCallback(
    async (payload: any) => {
      try {
        const body =
          payload.type === "single"
            ? {
                categoryId,
                questionId: payload.questionId,
                selectedIndex: payload.selectedIndex,
              }
            : { categoryId, score: payload.score, results: payload.results || history };

        const res = await fetch("/api/quiz-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Failed to save");

        const data = await res.json();
        if (data.unlockedBadges && data.unlockedBadges.length > 0) {
          data.unlockedBadges.forEach((badge: any) => {
            addToast(
              `${badge.icon} ¡Logro Desbloqueado: ${badge.name}!`,
              "success",
              5000
            );
          });
        }

        return true;
      } catch (e) {
        console.error("Failed to save progress:", e);
        addToast("Error al guardar progreso. Verifica tu conexión.", "error");
        return false;
      }
    },
    [categoryId, history, addToast]
  );

  const handleAnswer = useCallback(
    (index: number) => {
      if (!q || selected !== null) return;
      setSelected(index);
      setAnswered((a) => a + 1);

      const isCorrect = index === q.correctIndex;
      if (isCorrect) {
        setScore((s) => s + 1);
        addToast("¡Respuesta correcta! 🚀", "success", 2000);
      } else {
        addToast("Respuesta incorrecta. ¡Sigue intentando!", "warning", 2000);
      }

      setHistory((prev) => [...prev, { questionId: q.id, isCorrect }]);
      saveProgress({ type: "single", questionId: q.id, selectedIndex: index });

      if (!isExamMode) setShowExplanation(true);
    },
    [q, selected, isExamMode, saveProgress, addToast]
  );

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
        setQuestions((prev) =>
          prev.map((qq) => (qq.id === updated.id ? updated : qq))
        );
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

  const nextQuestion = async () => {
    if (isSavingFinal) return;
    if (selected === q?.correctIndex) setCompletedCount((prev) => prev + 1);

    if (current + 1 >= total) {
      const finalScore =
        totalQuestionsInCategory > 0
          ? Math.round(
              ((completedCount + (selected === q?.correctIndex ? 1 : 0)) /
                totalQuestionsInCategory) *
                100
            )
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
  };

  const startExamMode = () => {
    if (total === 0) return;
    setIsExamMode(true);
    setIsTimePressure(true);
    setIsZenMode(true);
    restart();
    setView("quiz");
  };

  const restart = () => {
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
  };

  const resetProgress = async () => {
    if (!window.confirm("¿Estás seguro de que quieres reiniciar tu progreso?"))
      return;
    setIsResetting(true);
    try {
      const res = await fetch(`/api/quiz-progress?categoryId=${categoryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("Progreso reiniciado. 🔄", "info");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e) {
      addToast("Error de conexión.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const reportError = async (reason: string) => {
    if (!q || isReporting) return;
    if (reason.trim().length < 8) return alert("Describe más el error.");
    setIsReporting(true);
    try {
      const res = await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id, reason }),
      });
      if (res.ok) {
        alert("Reporte enviado.");
        setReportReason("");
        setReportOpen(false);
      }
    } finally {
      setIsReporting(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isTimePressure && !selected && !finished && view === "quiz") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswer(-1);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTimePressure, selected, finished, current, handleAnswer, view]);

  // Filter categories
  const selectedCareer = careers?.find((c) => c.id === selectedCareerId);
  const filteredCategories = selectedCareer?.categories || [];

  if (finished && total > 0) {
    return (
      <QuizResults
        score={score}
        total={total}
        isExamMode={isExamMode}
        restart={restart}
      />
    );
  }

  return (
    <div className={`quiz-layout ${isZenMode ? "zen-mode" : ""}`}>
      {sidebarOpen && (
        <div
          className="quiz-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {!isZenMode && (
        <QuizSidebar
          {...{
            isZenMode,
            sidebarOpen,
            setSidebarOpen,
            selectedCareerId,
            setSelectedCareerId,
            careers,
            filteredCategories,
            categoryId,
            view,
            setView: setView as any,
            isExamMode,
            total,
            startExamMode,
            restart,
            theory,
            isTimePressure,
            setIsTimePressure,
            setIsZenMode,
            resetProgress,
            isResetting,
          }}
        />
      )}

      <div
        className="quiz-main"
        style={{
          maxWidth:
            isZenMode || view === "theory" || view === "flashcards" ? 850 : "none",
          margin:
            isZenMode || view === "theory" || view === "flashcards"
              ? "0 auto"
              : "0",
          width: "100%",
        }}
      >
        {view === "theory" ? (
          <TheoryView
            {...{
              careerName,
              categoryName,
              total,
              setView: setView as any,
              theory,
            }}
          />
        ) : view === "flashcards" ? (
          <FlashcardsView
            {...{
              current,
              total,
              q: q as any,
              isFlipped,
              setIsFlipped,
              setCurrent,
              nextQuestion,
            }}
          />
        ) : (
          <>
            <QuizHeader
              {...{
                careerName,
                categoryName,
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
                onEdit: () => {
                  setEditedQuestion({ ...q });
                  setIsEditing(true);
                },
              }}
            />

            <div
              style={{
                height: 3,
                background: "var(--bg-card)",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: isExamMode ? "var(--danger-400)" : "var(--accent-400)",
                  transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            {total === 0 ? (
              <div
                className="solid-card animate-fade-in"
                style={{ padding: "4rem 2rem", textAlign: "center" }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✨</div>
                <h2
                  style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}
                >
                  ¡Módulo Completado!
                </h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                  Has respondido correctamente todas las preguntas.
                </p>
                <div
                  style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
                >
                  <button onClick={resetProgress} className="btn btn-primary">
                    Reiniciar para Practicar
                  </button>
                  <Link href="/quiz" className="btn btn-secondary">
                    Ir a otra Materia
                  </Link>
                </div>
              </div>
            ) : (
              <QuizQuestion {...{ q: q as any, selected, handleAnswer, isExamMode }} />
            )}

            {total > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div
                  className="quiz-actions-row"
                  style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
                >
                  {q?.hint && selected === null && !isExamMode && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="btn btn-ghost"
                      style={{ color: "var(--warning-400)", fontSize: "0.875rem" }}
                    >
                      💡 {showHint ? "Ocultar Pista" : "Ver Pista"}
                    </button>
                  )}
                  <button
                    onClick={() => setReportOpen(!reportOpen)}
                    className="btn btn-ghost"
                    style={{
                      color: "var(--text-tertiary)",
                      fontSize: "0.8125rem",
                      opacity: 0.8,
                    }}
                  >
                    🚩 Reportar Error
                  </button>
                </div>
                {selected !== null && (
                  <button
                    onClick={nextQuestion}
                    className="btn btn-primary animate-fade-in quiz-next-btn"
                    disabled={isSavingFinal}
                  >
                    {isSavingFinal
                      ? "Guardando..."
                      : current + 1 >= total
                      ? "Ver Resultados 🏆"
                      : "Siguiente →"}
                  </button>
                )}
              </div>
            )}

            {total > 0 && reportOpen && (
              <div
                className="solid-card animate-fade-in"
                style={{
                  padding: "0.875rem",
                  marginBottom: "0.75rem",
                  border: "1px solid rgba(244,63,94,0.25)",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "0.375rem",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  ¿Qué problema encontraste?
                </label>
                <textarea
                  className="input textarea"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Ej: error de redacción..."
                  style={{ minHeight: 86, marginBottom: "0.625rem" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                    Mínimo 8 caracteres.
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setReportOpen(false)}
                      disabled={isReporting}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => reportError(reportReason)}
                      disabled={isReporting}
                    >
                      {isReporting ? "Enviando..." : "Enviar Reporte"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {total > 0 && showHint && !showExplanation && !isExamMode && (
              <div
                className="solid-card animate-fade-in"
                style={{
                  padding: "1rem",
                  borderLeft: "3px solid var(--warning-400)",
                  background: "rgba(245,158,11,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>💡</span>
                  <div>
                    <strong>Pista:</strong>
                    {q?.hint && <MathText>{q.hint}</MathText>}
                  </div>
                </div>
              </div>
            )}

            {total > 0 && showExplanation && q?.explanation && !isExamMode && (
              <div
                className="solid-card animate-fade-in"
                style={{
                  padding: "1.25rem",
                  borderLeft: "3px solid var(--accent-400)",
                  background: "rgba(34,211,238,0.05)",
                  marginTop: "0.75rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--accent-400)",
                    marginBottom: "0.375rem",
                    textTransform: "uppercase",
                  }}
                >
                  Justificación
                </p>
                <MathText className="quiz-explanation-text">
                  {q.explanation}
                </MathText>
              </div>
            )}
          </>
        )}
      </div>

      {!isZenMode && (
        <nav className="quiz-mobile-bottom-nav">
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
            className="quiz-mobile-bottom-link"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span>{sidebarOpen ? "✕" : "☰"}</span>
            <span>{sidebarOpen ? "Cerrar" : "Panel"}</span>
          </button>
        </nav>
      )}

      <AdminQuestionEditor
        {...{
          isEditing,
          setIsEditing,
          editedQuestion: editedQuestion as any,
          setEditedQuestion: setEditedQuestion as any,
          handleSaveEdit,
          isSavingEdit,
        }}
      />
    </div>
  );
}
