"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "stats", label: "Inicio" },
  { id: "ventajas", label: "Ventajas" },
  { id: "planes", label: "Planes" },
  { id: "preguntas", label: "Dudas" },
];

export default function LandingSectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -50% 0px", threshold: [0.1, 0.5] }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="premium-pill" style={{ pointerEvents: "auto" }}>
      <div className="flex items-center gap-1 relative z-10">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`nav-link-premium ${isActive ? "active" : ""}`}
              style={{ pointerEvents: "auto", cursor: "pointer", textDecoration: "none" }}
            >
              <span className="relative z-10">{section.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="nav-pill-highlight"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
