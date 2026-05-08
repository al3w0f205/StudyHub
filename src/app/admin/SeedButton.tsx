"use client";

import { useState } from "react";
import { runSeed, runMigration } from "./seed-action";
import React from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  async function handleSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await runSeed();
      setResult(res);
      setTimeout(() => setResult(null), 10000);
    } catch (e) {
      setResult({ success: false, error: "Error desconocido al sincronizar datos" });
    }
    setLoading(false);
  }

  async function handleMigration() {
    setMigrationLoading(true);
    setResult(null);
    try {
      const res = await runMigration();
      setResult(res);
      setTimeout(() => setResult(null), 10000);
    } catch (e) {
      setResult({ success: false, error: "Error desconocido al migrar estructura" });
    }
    setMigrationLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={handleMigration}
          disabled={loading || migrationLoading}
          className="btn btn-secondary btn-sm"
          style={{ background: "var(--bg-tertiary)", borderColor: "var(--warning-400)" }}
        >
          {migrationLoading ? "Migrando..." : "🛠️ Sincronizar Estructura"}
        </button>

        <button
          onClick={handleSeed}
          disabled={loading || migrationLoading}
          className="btn btn-secondary btn-sm"
        >
          {loading ? "Sincronizando..." : "📥 Sincronizar Preguntas (.json)"}
        </button>
      </div>

      {result && (
        <span
          style={{
            fontSize: "0.75rem",
            color: result.success ? "var(--success-400)" : "var(--danger-400)",
            fontWeight: "600",
            textAlign: "right",
            maxWidth: "300px",
            background: "rgba(0,0,0,0.2)",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px"
          }}
        >
          {result.success ? result.message : result.error}
        </span>
      )}
    </div>
  );
}

