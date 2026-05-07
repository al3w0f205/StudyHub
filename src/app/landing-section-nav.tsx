"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "stats", label: "Contenido" },
  { id: "features", label: "Ventajas" },
  { id: "pricing", label: "Precio" },
  { id: "preguntas", label: "FAQs" },
];

export default function LandingSectionNav() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section that is most visible in the viewport
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.1, 0.5, 0.8],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="relative flex items-center bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/5 shadow-2xl">
      {/* Sliding Active Background (iPhone Style) */}
      <div className="absolute inset-0 p-1.5 flex pointer-events-none">
        {SECTIONS.map((section) => (
          <div key={section.id} className="flex-1 relative">
            {activeId === section.id && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Links */}
      <div className="flex items-center">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`relative z-10 px-5 py-1.5 text-[13px] font-bold uppercase tracking-wider transition-colors duration-300 ${
              activeId === section.id 
                ? "text-black" 
                : "text-white/50 hover:text-white"
            }`}
          >
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
