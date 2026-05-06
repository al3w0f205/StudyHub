"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import React from "react";

const MathText = dynamic(() => import("@/components/ui/MathText"));

interface TheoryViewProps {
  careerName: string;
  categoryName: string;
  total: number;
  setView: (view: "quiz" | "flashcards" | "theory") => void;
  theory: string | null;
}

export default function TheoryView({
  careerName,
  categoryName,
  total,
  setView,
  theory,
}: TheoryViewProps) {
  return (
    <div className="animate-fade-in">
      <div className="quiz-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Link
              href="/quiz"
              className="quiz-breadcrumb"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                cursor: "pointer",
              }}
            >
              🏠 {careerName} <span style={{ margin: "0 0.375rem" }}>/</span>{" "}
              <strong style={{ color: "var(--accent-400)" }}>
                {categoryName}
              </strong>
            </Link>
          </div>
          <h1 className="quiz-question-number">Material de Estudio</h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
            style={{ border: "1px solid var(--border-default)" }}
          >
            📄 Descargar PDF
          </button>
          {total > 0 && (
            <button
              onClick={() => setView("quiz")}
              className="btn btn-primary btn-sm"
            >
              Empezar Quiz →
            </button>
          )}
          <Link
            href="/quiz"
            className="btn btn-sm btn-secondary"
            style={{ border: "1px solid var(--border-default)", fontWeight: 700 }}
          >
            SALIR ✕
          </Link>
        </div>
      </div>

      <div
        className="solid-card printable-content"
        style={{ padding: "2rem", lineHeight: 1.8 }}
      >
        <MathText className="theory-content">{theory}</MathText>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
    </div>
  );
}
