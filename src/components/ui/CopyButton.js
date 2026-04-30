"use client";

import { Copy } from "lucide-react";
import { useState } from "react";

export default function CopyButton({ text, label, fullWidth = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (label) {
    return (
      <button
        onClick={handleCopy}
        className="btn btn-sm"
        style={{
          width: fullWidth ? "100%" : "auto",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid var(--border-default)",
          fontSize: "0.75rem",
          marginTop: "0.5rem",
          color: copied ? "var(--success-400)" : "var(--text-secondary)",
          transition: "all 0.2s ease",
          height: "36px"
        }}
      >
        {copied ? "¡Copiado!" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="btn btn-sm"
      style={{
        padding: "0.4rem",
        minWidth: "32px",
        height: "32px",
        background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
        color: copied ? "var(--success-400)" : "inherit",
        transition: "all 0.2s ease"
      }}
      title="Copiar"
    >
      {copied ? "✓" : <Copy size={14} />}
    </button>
  );
}
