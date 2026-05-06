"use client";

import { Edit2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  hint?: string | null;
  explanation?: string | null;
}

interface AdminQuestionEditorProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editedQuestion: Question | null;
  setEditedQuestion: (val: Question | null) => void;
  handleSaveEdit: () => Promise<void>;
  isSavingEdit: boolean;
}

export default function AdminQuestionEditor({
  isEditing,
  setIsEditing,
  editedQuestion,
  setEditedQuestion,
  handleSaveEdit,
  isSavingEdit,
}: AdminQuestionEditorProps) {
  if (!editedQuestion) return null;

  return (
    <AnimatePresence>
      {isEditing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="solid-card"
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              border: "1px solid var(--primary-400)",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                color: "var(--primary-400)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Edit2 size={20} /> Editor de Pregunta (Modo Admin)
            </h2>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  Pregunta
                </label>
                <textarea
                  className="input"
                  value={editedQuestion.text}
                  onChange={(e) =>
                    setEditedQuestion({ ...editedQuestion, text: e.target.value })
                  }
                  style={{ minHeight: "80px", marginTop: "0.25rem" }}
                />
              </div>

              <div style={{ display: "grid", gap: "0.5rem" }}>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  Opciones
                </label>
                {editedQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
                  >
                    <input
                      type="radio"
                      name="correct"
                      checked={editedQuestion.correctIndex === i}
                      onChange={() =>
                        setEditedQuestion({ ...editedQuestion, correctIndex: i })
                      }
                    />
                    <input
                      className="input"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...editedQuestion.options];
                        newOpts[i] = e.target.value;
                        setEditedQuestion({
                          ...editedQuestion,
                          options: newOpts,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  Pista (Hint)
                </label>
                <input
                  className="input"
                  value={editedQuestion.hint || ""}
                  onChange={(e) =>
                    setEditedQuestion({ ...editedQuestion, hint: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                  }}
                >
                  Explicación
                </label>
                <textarea
                  className="input"
                  value={editedQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditedQuestion({
                      ...editedQuestion,
                      explanation: e.target.value,
                    })
                  }
                  style={{ minHeight: "80px", marginTop: "0.25rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
                disabled={isSavingEdit}
              >
                {isSavingEdit ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save size={18} /> Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
