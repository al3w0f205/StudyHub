"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { id: "stats", label: "Inicio" },
  { id: "features", label: "Ventajas" },
  { id: "pricing", label: "Planes" },
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <nav className="relative flex items-center bg-white/5 border border-white/5 p-1 rounded-full backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-1 relative z-10">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={`relative px-6 py-2 text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-300 min-w-[100px] ${
                isActive ? "text-emerald-400" : "text-white/30 hover:text-white/60"
              }`}
            >
              <span className="relative z-10">{section.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="nav-pill-highlight"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
