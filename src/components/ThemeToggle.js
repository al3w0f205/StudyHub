"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("studyhub_theme") || "dark";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("studyhub_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) {
    return <div style={{ width: 44, height: 44 }} />; // placeholder to prevent layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{ padding: "0.5rem", borderRadius: "var(--radius-full)", width: "44px", height: "44px" }}
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
