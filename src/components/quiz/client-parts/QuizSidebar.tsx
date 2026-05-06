"use client";

import Link from "next/link";
import React from "react";

interface Career {
  id: string;
  name: string;
  categories: { id: string; name: string }[];
}

interface QuizSidebarProps {
  isZenMode: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  selectedCareerId: string;
  setSelectedCareerId: (val: string) => void;
  careers?: Career[];
  filteredCategories: { id: string; name: string }[];
  categoryId: string;
  view: "quiz" | "flashcards" | "theory";
  setView: (val: "quiz" | "flashcards" | "theory") => void;
  isExamMode: boolean;
  total: number;
  startExamMode: () => void;
  restart: () => void;
  theory?: string | null;
  isTimePressure: boolean;
  setIsTimePressure: (val: boolean) => void;
  setIsZenMode: (val: boolean) => void;
  resetProgress: () => void;
  isResetting: boolean;
}

export default function QuizSidebar({
  isZenMode,
  sidebarOpen,
  setSidebarOpen,
  selectedCareerId,
  setSelectedCareerId,
  careers,
  filteredCategories,
  categoryId,
  view,
  setView,
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
}: QuizSidebarProps) {
  return (
    <div
      className={`solid-card quiz-sidebar ${
        sidebarOpen ? "quiz-sidebar-open" : ""
      }`}
    >
      {/* Main Menu Button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/quiz"
          className="btn btn-secondary"
          style={{
            width: "100%",
            justifyContent: "flex-start",
            gap: "0.75rem",
            fontSize: "0.8125rem",
          }}
        >
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
          {careers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Categories for selected career */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 className="quiz-sidebar-title">Categorías</h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
        >
          {filteredCategories.map((c) => (
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
                color:
                  c.id === categoryId
                    ? "var(--accent-400)"
                    : "var(--text-secondary)",
                background:
                  c.id === categoryId ? "rgba(45,212,191,0.08)" : "transparent",
                border:
                  c.id === categoryId
                    ? "1px solid rgba(45,212,191,0.2)"
                    : "1px solid transparent",
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
            onClick={() => {
              setView("quiz");
              restart();
            }}
            className={`btn btn-sm ${
              view === "quiz" && !isExamMode ? "btn-primary" : "btn-secondary"
            }`}
            disabled={total === 0}
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
          >
            ✍️ Cuestionario
          </button>
          <button
            onClick={() => {
              setView("flashcards");
              restart();
            }}
            className={`btn btn-sm ${
              view === "flashcards" ? "btn-primary" : "btn-secondary"
            }`}
            disabled={total === 0}
            style={{ width: "100%", justifyContent: "flex-start", gap: "0.5rem" }}
          >
            🃏 Flashcards
          </button>
          {theory && (
            <button
              onClick={() => setView("theory")}
              className={`btn btn-sm ${
                view === "theory" ? "btn-primary" : "btn-secondary"
              }`}
              style={{
                width: "100%",
                justifyContent: "flex-start",
                gap: "0.5rem",
              }}
            >
              📚 Estudiar Teoría
            </button>
          )}
          <button
            onClick={startExamMode}
            className="btn btn-sm btn-secondary"
            disabled={total === 0}
            style={{
              width: "100%",
              justifyContent: "flex-start",
              gap: "0.5rem",
              border: "1px solid var(--danger-400)",
              color: "var(--danger-400)",
            }}
          >
            ⏱️ Simulacro Examen
          </button>
        </div>
      </div>

      {/* Tools */}
      <div>
        <h3 className="quiz-sidebar-title">Herramientas</h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
        >
          <label className="quiz-tool-label">
            <span>⏱️ Presión de Tiempo</span>
            <input
              type="checkbox"
              checked={isTimePressure}
              onChange={() => setIsTimePressure(!isTimePressure)}
              style={{ accentColor: "var(--accent-400)" }}
            />
          </label>

          <label className="quiz-tool-label">
            <span>👁️ Modo Enfoque</span>
            <input
              type="checkbox"
              checked={isZenMode}
              onChange={() => setIsZenMode(!isZenMode)}
              style={{ accentColor: "var(--accent-400)" }}
            />
          </label>

          <button
            onClick={() => window.location.reload()}
            className="quiz-tool-label"
            style={{
              background: "transparent",
              border: "1px solid var(--border-default)",
              cursor: "pointer",
              color: "var(--text-primary)",
              width: "100%",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
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
              marginTop: "0.5rem",
            }}
          >
            <span>
              {isResetting ? "⌛ Reiniciando..." : "🗑️ Reiniciar Progreso"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
