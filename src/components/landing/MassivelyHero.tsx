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
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.22]);
  const logoX = useTransform(scrollY, [0, 300], ["calc(45vw - 110px)", "40px"]);
  const logoY = useTransform(scrollY, [0, 300], ["calc(45vh - 40px)", "0px"]);
  
  // Opacity Controls for smoother transitions
  const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const navBarOpacity = useTransform(scrollY, [200, 300], [0, 1]);

  // Derived Nav Styles
  const navBg = useTransform(navBarOpacity, (v) => `rgba(5, 5, 5, ${v * 0.8})`);
  const navBlur = useTransform(navBarOpacity, (v) => `blur(${v * 20}px)`);
  const navBorder = useTransform(navBarOpacity, (v) => `1px solid rgba(255, 255, 255, ${v * 0.05})`);

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
        className="fixed top-0 left-0 right-0 h-20 z-[150] px-[8vw] flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-8 pointer-events-auto w-full max-w-7xl mx-auto">
          {/* Logo Landing Zone */}
          <div className="relative w-[180px] h-8 flex items-center">
            <motion.div
              style={{
                scale: logoScale,
                x: logoX,
                y: logoY,
                position: "absolute",
                left: 0,
                transformOrigin: "left center"
              }}
              className="whitespace-nowrap z-[160]"
            >
              <h1 className="shimmer-text select-none text-left text-7xl md:text-8xl tracking-tighter">STUDYHUB</h1>
            </motion.div>
          </div>

          {/* Navigation Pill */}
          <div className="hidden lg:block ml-16">
            <LandingSectionNav />
          </div>
        </div>

        {/* Action Buttons (Unified inside Header) */}
        <div className="flex items-center gap-4 pointer-events-auto relative z-[170]">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full transition-all text-xs font-bold uppercase tracking-wider"
              >
                Mi Panel
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 transition-all text-xs font-bold uppercase tracking-wider"
              >
                Practicar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider">
                Entrar
              </Link>
              <Link href="/auth/login" className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-lg shadow-cyan-500/20 transition-all text-xs font-bold uppercase tracking-wider hidden sm:block">
                Acceder
              </Link>
            </div>
          )}
        </div>
      </motion.header>

      {/* ── Hero Center Content ── */}
      <motion.div 
        style={{ opacity: heroContentOpacity }}
        className="flex flex-col items-center justify-center relative z-10 w-full pointer-events-none pt-24"
      >
          {/* Spacer for the animated logo which starts here at ~45vh */}
          <div className="h-[35vh] mb-4" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-8 mt-40 pointer-events-auto"
          >
            <div className="flex flex-col items-center gap-3">
              <span className="text-cyan-400/80 uppercase tracking-[0.4em] text-[10px] md:text-xs font-black">
                Preparación Académica Superior
              </span>
              <p className="text-blue-100/40 uppercase tracking-[0.2em] text-[11px] md:text-sm font-medium">
                Domina el examen con confianza y resultados reales
              </p>
            </div>

            <Link
              href="/auth/login"
              className="group relative px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all duration-300 shadow-2xl shadow-blue-600/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-3 font-bold text-sm uppercase tracking-widest">
                Continuar Practicando <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
      </motion.div>

    </section>
  );
};
