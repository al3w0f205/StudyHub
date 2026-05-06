"use client";

import React, { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string | null;
  color?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  trend = null,
  color = "var(--primary-400)",
}: StatCardProps) {
  return (
    <div
      className="solid-card"
      style={{
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-md)",
          background: `rgba(${
            color === "var(--primary-400)"
              ? "99, 102, 241"
              : color === "var(--success-400)"
              ? "16, 185, 129"
              : "244, 63, 94"
          }, 0.1)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: color,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            marginBottom: "0.25rem",
          }}
        >
          {label}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{value}</h3>
          {trend && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: trend.startsWith("+")
                  ? "var(--success-400)"
                  : "var(--danger-400)",
              }}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
