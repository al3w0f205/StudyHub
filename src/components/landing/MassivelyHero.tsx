"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React from "react";
import Link from "next/link";
import LandingSectionNav from "@/app/landing-section-nav";

interface MassivelyHeroProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  brandMark: React.ReactNode;
}

export const MassivelyHero = ({ isLoggedIn, dashboardUrl, brandMark }: MassivelyHeroProps) => {
  const { scrollY } = useScroll();

  // Logo Animation: From Viewport Center to Header Left
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.22]);
  const logoX = useTransform(scrollY, [0, 300], ["0vw", "-45vw"]);
  const logoY = useTransform(scrollY, [0, 300], ["45vh", "0vh"]);
  
  // Opacity Controls
  const heroContentOpacity = useTransform(scrollY, [0, 150], [1, 0]);
  const navBarOpacity = useTransform(scrollY, [200, 300], [0, 1]);
  const navContentOpacity = useTransform(scrollY, [250, 350], [0, 1]);

  // Derived Nav Styles
  const navBg = useTransform(navBarOpacity, (v) => `rgba(5, 5, 5, ${v * 0.8})`);
  const navBlur = useTransform(navBarOpacity, (v) => `blur(${v * 20}px)`);
  const navBorder = useTransform(navBarOpacity, (v) => `1px solid rgba(255, 255, 255, ${v * 0.05})`);

  return (
    <section className="massively-intro overflow-visible">
      {/* ── Fixed Header (Logo lands here and stays fixed) ── */}
      <motion.header 
        style={{ 
          background: navBg, 
          backdropFilter: navBlur,
          borderBottom: navBorder
        }}
        className="fixed top-0 left-0 right-0 h-20 z-[150] px-[5vw] flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-6 pointer-events-auto">
          {/* THE LOGO: Starts at viewport center, lands here, stays fixed */}
          <motion.div
            style={{
              scale: logoScale,
              x: logoX,
              y: logoY,
              position: "absolute",
              left: "50%",
              top: "50%",
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="flex items-center"
          >
            <h1 className="shimmer-text select-none text-center">STUDYHUB</h1>
          </motion.div>

          {/* Spacer to give room for the logo when it lands */}
          <div className="w-[180px] h-1 max-md:hidden" /> 
          
          <div className="hidden md:block">
            <LandingSectionNav />
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {isLoggedIn ? (
            <>
              <Link href={dashboardUrl} className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white hidden sm:block">
                Mi Panel
              </Link>
              <Link href="/quiz" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                Practicar
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white">
                Entrar
              </Link>
              <Link href="/auth/register" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hidden sm:block">
                Prueba Gratis
              </Link>
            </>
          )}
        </div>
      </motion.header>

      {/* ── Hero Center Content (Logo removed from here) ── */}
      <div className="flex flex-col items-center justify-center relative z-10 w-full pointer-events-none">
        <motion.div style={{ opacity: heroContentOpacity }} className="mb-8">
          <p className="text-white/40 uppercase tracking-[0.4em] text-[11px] font-bold">
            Preparación Académica Superior
          </p>
        </motion.div>

        <motion.div style={{ opacity: heroContentOpacity }} className="mt-8 flex flex-col items-center">
          <div className="w-12 h-[1px] bg-emerald-500/50 mb-6" />
          <p className="text-white/60 uppercase tracking-[0.2em] text-[12px]">
            Domina el examen con confianza
          </p>
        </motion.div>
      </div>

      <motion.div 
        style={{ opacity: heroContentOpacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
      </motion.div>
    </section>
  );
};
