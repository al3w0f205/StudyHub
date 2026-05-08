"use client";

import Link from "next/link";
import CompetencyRadar from "@/components/dashboard/CompetencyRadar";
import React from "react";

interface Category {
  id: string;
  name: string;
  career: {
    name: string;
  };
}

interface ClientStatsProps {
  categories: Category[];
  progress: Record<string, number>;
  user?: {
    streak: number;
    totalPoints: number;
  };
}

export default function ClientStats({
  categories,
  progress,
  user,
}: ClientStatsProps) {
  if (!progress) return null;

  const statsList = Object.keys(progress)
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        name: cat ? cat.name : "Desconocida",
        careerName: cat ? cat.career.name : "",
        score: progress[id],
      };
    })
    .filter((s) => s.name !== "Desconocida");

  const needsImprovement = [...statsList]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const mastered = [...statsList]
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score >= 70)
    .slice(0, 3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}
    >
      {/* Quick Actions Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
          gridColumn: "1 / -1",
        }}
      >
        <Link
          href="/quiz/repaso"
          className="solid-card hover-scale"
          style={{
            padding: "1.25rem",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            borderLeft: "4px solid var(--accent-400)",
            background:
              "linear-gradient(135deg, rgba(34,211,238,0.05) 0%, transparent 100%)",
          }}
        >
          <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🧠</div>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              marginBottom: "0.25rem",
            }}
          >
            Repaso Inteligente
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Domina lo que fallaste
          </p>
        </Link>

        <Link
          href="/badges"
          className="solid-card hover-scale"
          style={{
            padding: "1.25rem",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            borderLeft: "4px solid var(--warning-400)",
            background:
              "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)",
          }}
        >
          <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🏅</div>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              marginBottom: "0.25rem",
            }}
          >
            Mis Logros
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Tus medallas
          </p>
        </Link>

        <Link
          href="/leaderboard"
          className="solid-card hover-scale"
          style={{
            padding: "1.25rem",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            borderLeft: "4px solid var(--primary-400)",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 100%)",
          }}
        >
          <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🏆</div>
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              marginBottom: "0.25rem",
            }}
          >
            Clasificación
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            Ranking global
          </p>
        </Link>
      </div>

      {/* Radar Chart */}
      {/* @ts-ignore - Radar migration pending */}
      <CompetencyRadar />

      {/* Gamification Stats */}
      <div
        className="solid-card animate-fade-in"
        style={{
          padding: "1.5rem",
          background: "var(--gradient-primary)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: "none",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", lineHeight: 1 }}>
              {user?.streak || 0}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "0.25rem",
                opacity: 0.9,
              }}
            >
              🔥 Racha (Días)
            </div>
          </div>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <div>
            <div style={{ fontSize: "2.5rem", fontWeight: "900", lineHeight: 1 }}>
              {user?.totalPoints?.toLocaleString() || 0}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginTop: "0.25rem",
                opacity: 0.9,
              }}
            >
              ✨ Puntos
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "0.8125rem",
              textAlign: "center",
              fontWeight: "500",
              opacity: 0.95,
            }}
          >
            {user && user.streak > 0
              ? "¡Mantén la llama encendida!"
              : "¡Empieza hoy tu racha!"}
          </div>
          <Link
            href="/badges"
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: "white",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              opacity: 0.8,
            }}
          >
            Ver mis logros 🏅
          </Link>
        </div>
      </div>

      {/* Needs Improvement */}
      <div
        className="solid-card animate-fade-in animate-fade-in-delay-1"
        style={{ padding: "1.5rem", borderLeft: "4px solid var(--danger-400)" }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>📉</span> Áreas a Mejorar
        </h2>
        {needsImprovement.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {needsImprovement.map((s) => (
              <div key={s.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8125rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "150px",
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--danger-400)" }}>
                    {s.score}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--bg-tertiary)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.score}%`,
                      background: "var(--danger-400)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-tertiary)",
              padding: "1rem 0",
            }}
          >
            ¡Todo va por buen camino!
          </p>
        )}
      </div>

      {/* Mastered */}
      <div
        className="solid-card animate-fade-in animate-fade-in-delay-2"
        style={{ padding: "1.5rem", borderLeft: "4px solid var(--success-400)" }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>🏆</span> Áreas Dominadas
        </h2>
        {mastered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {mastered.map((s) => (
              <div key={s.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8125rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "150px",
                    }}
                  >
                    {s.name}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--success-400)" }}>
                    {s.score}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--bg-tertiary)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${s.score}%`,
                      background: "var(--success-400)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-tertiary)",
              padding: "1rem 0",
            }}
          >
            Aún no hay áreas al 70%+.
          </p>
        )}
      </div>
    </div>
  );
}
