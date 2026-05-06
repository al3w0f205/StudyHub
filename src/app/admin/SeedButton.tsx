"use client";

import { useState } from "react";
import { runSeed } from "./seed-action";
import React from "react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
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
      setTimeout(() => setResult(null), 5000);
    } catch (e) {
      setResult({ success: false, error: "Error desconocido" });
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="btn btn-secondary btn-sm"
      >
        {loading ? "Sincronizando..." : "📥 Sincronizar Preguntas (.json)"}
      </button>

      {result && (
        <span
          style={{
            fontSize: "0.875rem",
            color: result.success ? "var(--success-400)" : "var(--danger-400)",
            fontWeight: "600",
          }}
        >
          {result.success ? result.message : result.error}
        </span>
      )}
    </div>
  );
}
