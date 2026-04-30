// CompetencyRadar — Gráfico radar SVG de competencias por materia.
// Renderizado custom con SVG (sin librería de gráficos). Muestra dominio
// por categoría (0-100%). Requiere mínimo 3 categorías para renderizar.
// Datos obtenidos de GET /api/user/analytics.
"use client";
import React, { useEffect, useState } from "react";

export default function CompetencyRadar() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/analytics")
      .then(res => res.json())
      .then(json => {
        if (json.data) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="solid-card" style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner"></div>
    </div>
  );

  if (data.length < 3) return null; // Need at least 3 points for a radar

  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  const levels = 4;
  
  const getCoordinates = (index, total, value) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (radius * value) / 100;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const points = data.map((d, i) => getCoordinates(i, data.length, d.value));
  const pointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="solid-card animate-fade-in" style={{ padding: "1.5rem" }}>
      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "800" }}>📊 Radar de Competencias</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Tu dominio por materia</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <svg width={size} height={size}>
          {/* Circular Levels */}
          {[...Array(levels)].map((_, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={(radius * (i + 1)) / levels}
              fill="none"
              stroke="var(--border-default)"
              strokeDasharray="4,4"
              opacity={0.5}
            />
          ))}

          {/* Axis */}
          {data.map((_, i) => {
            const end = getCoordinates(i, data.length, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="var(--border-default)"
                opacity={0.3}
              />
            );
          })}

          {/* Area */}
          <polygon
            points={pointsString}
            fill="rgba(34, 211, 238, 0.15)"
            stroke="var(--accent-400)"
            strokeWidth="2"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent-400)" />
          ))}

          {/* Labels */}
          {data.map((d, i) => {
            const pos = getCoordinates(i, data.length, 115);
            return (
              <text
                key={i}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--text-secondary)"
              >
                {d.name.substring(0, 10)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
