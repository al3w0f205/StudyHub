"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandingSectionNav from "@/app/landing-section-nav";

interface MassivelyHeroProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
}

export const MassivelyHero = ({
  isLoggedIn,
  dashboardUrl,
}: MassivelyHeroProps) => {
  const { scrollY } = useScroll();
  const titleRef = useRef<HTMLHeadingElement>(null);

  const scrollProgress = useTransform(scrollY, [0, 400], [0, 1]);
  const headerOpacity = useTransform(scrollY, [160, 320], [0, 1]);
  const headerBg = useTransform(
    headerOpacity,
    (v) => `rgba(2, 2, 2, ${v * 0.92})`
  );
  const headerBlur = useTransform(headerOpacity, (v) => `blur(${v * 20}px)`);
  const headerBorder = useTransform(
    headerOpacity,
    (v) => `1px solid rgba(255, 255, 255, ${v * 0.08})`
  );

  const heroOpacity = useTransform(scrollY, [0, 220], [1, 0]);
  const heroTranslateY = useTransform(scrollY, [0, 220], [0, -44]);

  const titleLeft = useTransform(
    scrollProgress,
    (p) => `calc(${50 * (1 - p)}% + ${48 * p}px)`
  );
  const titleTop = useTransform(
    scrollProgress,
    (p) => `calc(${31 * (1 - p)}vh + ${20 * p}px)`
  );
  const titleTranslateX = useTransform(
    scrollProgress,
    (p) => `calc(${-50 * (1 - p)}%)`
  );
  const titleTranslateY = useTransform(
    scrollProgress,
    (p) => `calc(${-50 * (1 - p)}%)`
  );
  const titleScale = useTransform(scrollProgress, (p) => 1 - 0.78 * p);

  return (
    <section className="massively-hero relative min-h-[78svh]">
      <motion.div
        style={{
          background: headerBg,
          backdropFilter: headerBlur,
          borderBottom: headerBorder,
          opacity: headerOpacity,
        }}
        className="fixed top-0 left-0 right-0 h-[72px] z-[140]"
        aria-hidden="true"
      />

      <header className="fixed top-0 left-0 right-0 h-[72px] z-[160] flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex items-center justify-between relative">
          <div className="w-[160px] sm:w-[200px] shrink-0" />

          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 pointer-events-auto">
            <LandingSectionNav />
          </div>

          <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto">
            <LandingSectionNav />
          </div>

          <nav className="premium-pill pointer-events-auto">
            <div className="flex items-center gap-1 relative z-10">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="nav-link-premium">
                    <span className="relative z-10">Mi Panel</span>
                  </Link>
                  <Link href={dashboardUrl} className="nav-link-premium active">
                    <span className="relative z-10">Practicar</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="nav-link-premium">
                    <span className="relative z-10">Entrar</span>
                  </Link>
                  <Link href="/auth/login" className="nav-link-premium active">
                    <span className="relative z-10">Acceder</span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <motion.h1
        ref={titleRef}
        style={{
          position: "fixed",
          top: titleTop,
          left: titleLeft,
          x: titleTranslateX,
          y: titleTranslateY,
          scale: titleScale,
          transformOrigin: "left top",
          zIndex: 180,
          pointerEvents: "none",
        }}
        className="shimmer-text hero-logo select-none whitespace-nowrap"
      >
        STUDYHUB
      </motion.h1>

      <div className="relative min-h-[100svh] flex flex-col items-center justify-center">
        <motion.div
          style={{
            opacity: heroOpacity,
            y: heroTranslateY,
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-12 pointer-events-auto mt-[46vh] px-6"
        >
          <div className="hero-copy-block flex flex-col items-center text-center gap-3">
            <span className="text-cyan-400 font-black uppercase tracking-[0.48em] md:tracking-[0.6em] text-[10px] md:text-xs">
              Preparación Académica de Sueño
            </span>
            <p className="text-white/35 uppercase tracking-[0.24em] md:tracking-[0.3em] text-[12px] md:text-sm font-semibold max-w-md leading-relaxed">
              Domina el examen con confianza y resultados reales
            </p>
          </div>

          <nav className="premium-pill">
            <div className="flex items-center gap-1 relative z-10">
              <Link href="/auth/login" className="nav-link-premium active">
                <span className="relative z-10 flex items-center gap-3">
                  Continuar Practicando <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </nav>
        </motion.div>
      </div>
    </section>
  );
};
