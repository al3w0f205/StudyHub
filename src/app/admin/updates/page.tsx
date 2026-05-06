"use client";
import React, { useState, useEffect } from "react";

interface UpdateEntry {
  id: string;
  title: string;
  content: string;
  type: string;
  version?: string;
  createdAt: string;
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  // const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "FEATURE",
    version: "",
  });

  useEffect(() => {
    fetchUpdates();
  }, []);

  async function fetchUpdates() {
    const res = await fetch("/api/updates");
    const data = await res.json();
    setUpdates(data);
    // setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ title: "", content: "", type: "FEATURE", version: "" });
      fetchUpdates();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar actualización?")) return;
    const res = await fetch(`/api/admin/updates?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchUpdates();
  }

  return (
    <div className="admin-container">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "800" }}>
          🚀 Gestión de Actualizaciones
        </h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          Anuncia nuevas funcionalidades a los usuarios
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Form */}
        <div className="solid-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
            }}
          >
            Nueva Actualización
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                TÍTULO
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="btn btn-secondary"
                style={{ width: "100%", textAlign: "left", cursor: "text" }}
                placeholder="Ej: Nuevo Modo Radar..."
                required
              />
            </div>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                  }}
                >
                  TIPO
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="btn btn-secondary"
                  style={{ width: "100%" }}
                >
                  <option value="FEATURE">Nueva Función</option>
                  <option value="UPDATE">Mejora</option>
                  <option value="FIX">Corrección</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    marginBottom: "0.5rem",
                  }}
                >
                  VERSIÓN
                </label>
                <input
                  type="text"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  className="btn btn-secondary"
                  style={{ width: "100%", textAlign: "left", cursor: "text" }}
                  placeholder="v1.2.0"
                />
              </div>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                CONTENIDO (MD)
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="btn btn-secondary"
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "text",
                  minHeight: "150px",
                }}
                placeholder="Describe los cambios..."
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Publicar Actualización
            </button>
          </form>
        </div>

        {/* List */}
        <div>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
            }}
          >
            Historial
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {updates.map((u) => (
              <div
                key={u.id}
                className="solid-card"
                style={{
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "800",
                      color: "var(--accent-400)",
                    }}
                  >
                    {u.type} {u.version}
                  </div>
                  <div style={{ fontWeight: "700" }}>{u.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--danger-400)" }}
                >
                  Eliminar
                </button>
              </div>
            ))}
            {updates.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-tertiary)",
                  padding: "2rem",
                }}
              >
                No hay actualizaciones publicadas.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
