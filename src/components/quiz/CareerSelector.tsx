"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import React from "react";

interface Career {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface CareerSelectorProps {
  careers: Career[];
  selectedCareerSlug?: string;
}

export default function CareerSelector({
  careers,
  selectedCareerSlug,
}: CareerSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function selectCareer(slug: string) {
    const currentY = window.scrollY;
    startTransition(() => {
      router.replace(`/quiz?career=${slug}`, { scroll: false });
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentY, behavior: "auto" });
      });
    });
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "0.75rem",
      }}
    >
      {careers.map((career) => {
        const isActive =
          selectedCareerSlug === career.slug ||
          (!selectedCareerSlug && careers[0]?.slug === career.slug);

        return (
          <button
            key={career.id}
            type="button"
            onClick={() => selectCareer(career.slug)}
            disabled={isPending}
            className={`solid-card ${isActive ? "active-career-card" : ""}`}
            style={{
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: "0.5rem",
              background: isActive
                ? "var(--gradient-primary)"
                : "var(--bg-card)",
              borderColor: isActive ? "transparent" : "var(--border-default)",
              color: isActive ? "white" : "var(--text-primary)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              textDecoration: "none",
              position: "relative",
              overflow: "hidden",
              minHeight: "100px",
            }}
          >
            <span
              style={{
                fontSize: "2rem",
                marginBottom: "0.25rem",
                filter: isActive
                  ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                  : "none",
              }}
            >
              {career.icon || "📚"}
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "700",
                lineHeight: "1.2",
              }}
            >
              {career.name}
            </span>
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  right: "0",
                  height: "3px",
                  background: "rgba(255,255,255,0.3)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
