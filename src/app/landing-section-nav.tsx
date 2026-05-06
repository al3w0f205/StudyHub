"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "stats", label: "Contenido" },
  { id: "features", label: "Ventajas" },
  { id: "steps", label: "Pasos" },
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
        threshold: [0.15, 0.3, 0.5, 0.75],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="landing-section-nav" aria-label="Secciones de la portada">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`landing-section-link ${
            activeId === section.id ? "active" : ""
          }`}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
