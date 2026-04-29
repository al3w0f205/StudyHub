"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function GlobalSearch({ categories }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const results = query.trim() 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(query.toLowerCase()) ||
        cat.career?.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="search-container" ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="input"
          placeholder="Buscar carrera o materia..."
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          style={{ 
            paddingLeft: "2.5rem", 
            borderRadius: "var(--radius-full)", 
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-default)"
          }}
        />
        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>
          🔍
        </span>
      </div>

      {isOpen && query.trim() && (
        <div style={{ 
          position: "absolute", 
          top: "calc(100% + 0.5rem)", 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          padding: "0.5rem",
          maxHeight: "350px",
          overflowY: "auto",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)"
        }}>
          {results.length > 0 ? (
            results.map((res) => (
              <Link
                key={res.id}
                href={`/quiz/${res.id}`}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  transition: "background 0.2s",
                  textDecoration: "none"
                }}
                className="hover-bg"
              >
                <span style={{ fontSize: "0.9375rem", fontWeight: "600", color: "var(--text-primary)" }}>{res.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{res.career?.name}</span>
              </Link>
            ))
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .hover-bg:hover {
          background: var(--glass-highlight);
        }
      `}</style>
    </div>
  );
}
