"use client";

import { useSyncExternalStore } from "react";
import React from "react";

const THEME_EVENT = "studyhub-theme-change";

function getThemeSnapshot() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("studyhub_theme") || "dark";
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "dark"
  );

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("studyhub_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        padding: "0.5rem",
        borderRadius: "var(--radius-full)",
        width: "44px",
        height: "44px",
      }}
      aria-label="Alternar Tema"
    >
      {theme === "dark" ? (
        <span style={{ fontSize: "1.25rem" }}>☀️</span>
      ) : (
        <span style={{ fontSize: "1.25rem" }}>🌙</span>
      )}
    </button>
  );
}
