"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LandingSectionNav from "@/app/landing-section-nav";

interface MassivelyHeroProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
}

export const MassivelyHero = ({ isLoggedIn, dashboardUrl }: MassivelyHeroProps) => {
  const { scrollY } = useScroll();

  // Logo Animation: From Viewport Center to Header Left Container
  // At scroll 0: Centered in viewport
  // At scroll 300: Positioned at the top-left logo zone
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.22]);
  const logoX = useTransform(scrollY, [0, 300], ["-50%", "0%"]);
  const logoLeft = useTransform(scrollY, [0, 300], ["50%", "0%"]);
  const logoY = useTransform(scrollY, [0, 300], ["calc(45vh - 80px)", "0px"]);
  const logoOrigin = useTransform(scrollY, [0, 300], ["center center", "left center"]);
  
  // Opacity Controls for smoother transitions
  const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const navBarOpacity = useTransform(scrollY, [200, 300], [0, 1]);

  // Derived Nav Styles
  const navBg = useTransform(navBarOpacity, (v) => `rgba(2, 2, 2, ${v * 0.85})`);
  const navBlur = useTransform(navBarOpacity, (v) => `blur(${v * 24}px)`);
  const navBorder = useTransform(navBarOpacity, (v) => `1px solid rgba(255, 255, 255, ${v * 0.08})`);

  return (
    <section className="massively-intro overflow-visible min-h-screen relative flex flex-col items-center justify-center">
      {/* ── Fixed Header ── */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          background: navBg, 
          backdropFilter: navBlur,
          borderBottom: navBorder
        }}
        className="fixed top-0 left-0 right-0 h-20 z-[150] px-[5vw] flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-12 pointer-events-auto w-full max-w-screen-2xl mx-auto relative">
          {/* Logo Landing Zone Placeholder (keeps layout stable) */}
          <div className="relative w-[220px] h-10 flex items-center shrink-0" />

          {/* Animated Logo: Center of viewport at scroll 0, header at scroll 300 */}
          <motion.div
            style={{
              scale: logoScale,
              x: logoX,
              left: logoLeft,
              y: logoY,
              position: "absolute",
              transformOrigin: logoOrigin
            }}
            className="whitespace-nowrap z-[160] pointer-events-none"
          >
            <h1 className="shimmer-text select-none text-center text-7xl md:text-8xl tracking-tighter pointer-events-auto">STUDYHUB</h1>
          </motion.div>

          {/* Navigation Pill */}
          <div className="hidden lg:block">
            <LandingSectionNav />
          </div>
        </div>

        {/* Action Buttons (Unified inside Header) */}
        <div className="flex items-center gap-4 pointer-events-auto relative z-[170]">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full transition-all text-[11px] font-bold uppercase tracking-wider"
              >
                Mi Panel
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all text-[11px] font-bold uppercase tracking-wider"
              >
                Practicar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-wider">
                Entrar
              </Link>
              <Link href="/auth/login" className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-lg shadow-cyan-500/20 transition-all text-[11px] font-bold uppercase tracking-wider hidden sm:block">
                Acceder
              </Link>
            </div>
          )}
        </div>
      </motion.header>

      {/* ── Hero Center Content ── */}
      <motion.div 
        style={{ opacity: heroContentOpacity }}
        className="flex flex-col items-center justify-center relative z-10 w-full pointer-events-none"
      >
          {/* Spacer for the animated logo which starts here at ~45vh */}
          <div className="h-[40vh]" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-10 mt-20 pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-cyan-400 font-black uppercase tracking-[0.6em] text-[10px] md:text-xs">
                Preparación Académica Superior
              </span>
              <p className="text-white/30 uppercase tracking-[0.3em] text-[12px] md:text-sm font-semibold max-w-md leading-relaxed">
                Domina el examen con confianza y resultados reales
              </p>
            </div>

            <Link
              href="/auth/login"
              className="group relative px-14 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-500 shadow-[0_20px_50px_rgba(37,99,235,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center gap-4 font-black text-xs uppercase tracking-[0.2em]">
                Continuar Practicando <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </span>
            </Link>
          </motion.div>
      </motion.div>

    </section>
  );
};
