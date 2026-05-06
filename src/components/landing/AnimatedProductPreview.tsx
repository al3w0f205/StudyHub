"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import React from "react";

const MathText = dynamic(() => import("@/components/ui/MathText"));

function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      S
    </div>
  );
}

interface AnimatedProductPreviewProps {
  totalFormatted: string;
  topCareer: { name: string; questionCount: number } | undefined;
}

export default function AnimatedProductPreview({
  totalFormatted,
  topCareer,
}: AnimatedProductPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Transform values for parallax and "unboxing" effect
  const sidebarX = useTransform(scrollYProgress, [0, 1], [-50, 0]);
  const sidebarOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const questionY = useTransform(scrollYProgress, [0, 1], [50, 0]);
  const questionOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const answer1X = useTransform(scrollYProgress, [0.2, 1], [50, 0]);
  const answer1Opacity = useTransform(scrollYProgress, [0.2, 0.9], [0, 1]);

  const answer2X = useTransform(scrollYProgress, [0.4, 1], [50, 0]);
  const answer2Opacity = useTransform(scrollYProgress, [0.4, 0.9], [0, 1]);

  const explanationY = useTransform(scrollYProgress, [0.6, 1], [30, 0]);
  const explanationOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 1]);

  return (
    <motion.div
      ref={containerRef}
      className="product-preview"
      aria-label="Vista previa de StudyHub"
      style={{ perspective: 1000 }}
    >
      <div className="preview-toolbar">
        <div className="preview-brand">
          <BrandMark />
          <span>StudyHub</span>
        </div>
        <span className="preview-pill">Simulacro activo</span>
      </div>

      <div className="preview-grid" style={{ overflow: "hidden" }}>
        <motion.aside
          className="preview-sidebar"
          style={{ x: sidebarX, opacity: sidebarOpacity }}
        >
          <span className="preview-label">Estudiante en Racha</span>
          <strong>🔥 5 Días</strong>
          <div className="preview-progress">
            <span style={{ width: "85%", background: "var(--warning-400)" }} />
          </div>
          <small>Nivel 12 — Maestro</small>
        </motion.aside>

        <div className="preview-question">
          <motion.div
            className="preview-question-topline"
            style={{ y: questionY, opacity: questionOpacity }}
          >
            <span>Modo Simulacro</span>
            <span>00:24 ⏱️</span>
          </motion.div>

          <motion.div
            className="preview-question-text"
            style={{ y: questionY, opacity: questionOpacity }}
          >
            <h3 style={{ margin: 0 }}>
              ¿Cuál es la derivada de <MathText>$f(x) = \sin(x)$</MathText>?
            </h3>
          </motion.div>

          <motion.div
            className="preview-answer selected"
            style={{
              borderColor: "var(--primary-400)",
              background: "rgba(99,102,241,0.1)",
              x: answer1X,
              opacity: answer1Opacity,
            }}
          >
            <span>A</span>
            <MathText>$\cos(x)$</MathText>
          </motion.div>

          <motion.div
            className="preview-answer"
            style={{
              x: answer2X,
              opacity: answer2Opacity,
            }}
          >
            <span>B</span>
            <MathText>$-\cos(x)$</MathText>
          </motion.div>

          <motion.div
            className="preview-explanation"
            style={{
              borderLeft: "3px solid var(--accent-400)",
              background: "rgba(34,211,238,0.05)",
              y: explanationY,
              opacity: explanationOpacity,
            }}
          >
            <strong>Justificación</strong>
            <p>
              La derivada de la función seno es el coseno positivo. StudyHub te
              muestra el paso a paso.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
