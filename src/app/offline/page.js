"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import QuizClient from "@/components/quiz/QuizClient";

export default function OfflineLibraryPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("studyhub_offline") || "[]");
    setItems(data);
  }, []);

  function deleteItem(id) {
    if (!window.confirm("¿Seguro que quieres eliminar esta materia de tu biblioteca offline?")) return;
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem("studyhub_offline", JSON.stringify(filtered));
    setItems(filtered);
  }

  if (selectedItem) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setSelectedItem(null)} 
          className="btn btn-secondary btn-sm"
          style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 100, borderRadius: "var(--radius-full)" }}
        >
          ← Volver a Biblioteca Offline
        </button>
        <QuizClient 
          questions={selectedItem.questions}
          theory={selectedItem.theory}
          categoryName={selectedItem.name}
          careerName={selectedItem.career}
          categoryId={selectedItem.id}
          isOfflineMode={true}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div className="page-header" style={{ textAlign: "center", display: "block", marginBottom: "3rem" }}>
        <h1 className="page-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📴 Biblioteca Offline</h1>
        <p className="page-subtitle" style={{ fontSize: "1.125rem" }}>Tus materias guardadas para estudiar sin internet</p>
        <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: "1.5rem", borderRadius: "var(--radius-full)" }}>
          ← Volver al Panel
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="solid-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1.5rem", opacity: 0.5 }}>📥</div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No hay contenido guardado</h2>
          <p style={{ color: "var(--text-tertiary)", maxWidth: "400px", margin: "0 auto 2rem" }}>
            Cuando estés revisando la teoría de una materia, pulsa el botón "Guardar Offline" para que aparezca aquí.
          </p>
          <Link href="/quiz" className="btn btn-primary">Explorar Cuestionarios</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {items.map(item => (
            <div key={item.id} className="solid-card hover-scale" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "180px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--accent-400)", fontWeight: "700", textTransform: "uppercase", marginBottom: "0.25rem" }}>{item.career}</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>{item.name}</h3>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                  {item.questions.length} preguntas guardadas
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button 
                  onClick={() => setSelectedItem(item)} 
                  className="btn btn-primary btn-sm" 
                  style={{ flex: 1 }}
                >
                  Estudiar Offline →
                </button>
                <button 
                  onClick={() => deleteItem(item.id)} 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: "var(--danger-400)" }}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
