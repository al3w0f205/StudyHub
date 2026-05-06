"use client";

import { useState, useSyncExternalStore } from "react";
import React from "react";

const AGREEMENT_EVENT = "studyhub-agreement-change";

function hasAgreement() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("studyhub_agreement") === "true";
}

function subscribeToAgreement(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(AGREEMENT_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AGREEMENT_EVENT, callback);
  };
}

export default function QuizAgreement() {
  const agreed = useSyncExternalStore(
    subscribeToAgreement,
    hasAgreement,
    () => true
  );
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (checked) {
      localStorage.setItem("studyhub_agreement", "true");
      window.dispatchEvent(new Event(AGREEMENT_EVENT));
    }
  };

  if (agreed) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        className="solid-card animate-fade-in"
        style={{
          maxWidth: 500,
          width: "100%",
          padding: "2rem",
          border: "1px solid var(--border-default)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1rem" }}
        >
          ⚠️
        </div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            marginBottom: "1rem",
            textAlign: "center",
            color: "var(--danger-400)",
          }}
        >
          Normas de Uso y Anti-Piratería
        </h2>

        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginBottom: "1rem",
            lineHeight: 1.6,
          }}
        >
          El acceso a este material es <strong>estrictamente personal e intransferible</strong>.
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          Al continuar, aceptas que{" "}
          <strong>compartir tu cuenta, grabar, o difundir el material</strong> de
          estos cuestionarios resultará en la{" "}
          <strong>suspensión inmediata y permanente</strong> de tu cuenta sin
          derecho a reembolso.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            padding: "1rem",
            background: "var(--bg-tertiary)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            marginBottom: "1.5rem",
            border: "1px solid var(--border-default)",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{
              marginTop: "0.25rem",
              accentColor: "var(--danger-400)",
              width: 18,
              height: 18,
            }}
          />
          <span
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-primary)",
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            He leído y acepto las consecuencias de compartir mi cuenta o difundir
            el material.
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!checked}
          className="btn"
          style={{
            width: "100%",
            background: checked ? "var(--danger-400)" : "var(--bg-tertiary)",
            color: checked ? "white" : "var(--text-tertiary)",
            opacity: checked ? 1 : 0.5,
            cursor: checked ? "pointer" : "not-allowed",
          }}
        >
          Entendido, empezar a estudiar
        </button>
      </div>
    </div>
  );
}
