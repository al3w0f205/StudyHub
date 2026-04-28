"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientStats({ categories }) {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("studyhub_progress");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {}
    } else {
      setProgress({});
    }
  }, []);

  if (!progress) return null; // loading

  const statsList = Object.keys(progress).map((id) => {
    const cat = categories.find((c) => c.id === id);
    return {
      id,
      name: cat ? cat.name : "Desconocida",
      careerName: cat ? cat.career.name : "",
      score: progress[id],
    };
  }).filter(s => s.name !== "Desconocida");

  // Sort by score ascending (lowest first = needs improvement)
  const needsImprovement = [...statsList].sort((a, b) => a.score - b.score).slice(0, 3);
  const mastered = [...statsList].sort((a, b) => b.score - a.score).filter(s => s.score >= 70).slice(0, 3);

  if (statsList.length === 0) {
    return (
      <div className="solid-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "0.5rem" }}>📊 Tu Rendimiento</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)" }}>
          Aún no has completado ningún cuestionario. ¡Empieza a practicar para ver tus estadísticas aquí!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
      
      {/* Needs Improvement */}
      <div className="solid-card animate-fade-in" style={{ padding: "1.5rem", borderLeft: "4px solid var(--danger-400)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>📉</span> Áreas a Mejorar
        </h2>
        {needsImprovement.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {needsImprovement.map((s) => (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{s.careerName} / <strong style={{ color: "var(--text-primary)" }}>{s.name}</strong></span>
                  <span style={{ fontWeight: 600, color: "var(--danger-400)" }}>{s.score}%</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.score}%`, background: "var(--danger-400)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>¡No tienes áreas con puntaje bajo!</p>
        )}
      </div>

      {/* Mastered */}
      <div className="solid-card animate-fade-in" style={{ padding: "1.5rem", borderLeft: "4px solid var(--success-400)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>🏆</span> Áreas Dominadas
        </h2>
        {mastered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {mastered.map((s) => (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{s.careerName} / <strong style={{ color: "var(--text-primary)" }}>{s.name}</strong></span>
                  <span style={{ fontWeight: 600, color: "var(--success-400)" }}>{s.score}%</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.score}%`, background: "var(--success-400)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>Aún no has alcanzado más del 70% en ningún área.</p>
        )}
      </div>

    </div>
  );
}
