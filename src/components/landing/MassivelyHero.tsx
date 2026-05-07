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
  const logoX = useTransform(scrollY, [0, 300], ["calc(45vw - 110px)", "0vw"]);
  const logoY = useTransform(scrollY, [0, 300], ["calc(45vh - 40px)", "0vh"]);
  
  // Opacity Controls
  const heroContentOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const navBarOpacity = useTransform(scrollY, [200, 300], [0, 1]);
  const navContentOpacity = useTransform(scrollY, [250, 350], [0, 1]);

  // Derived Nav Styles
  const navBg = useTransform(navBarOpacity, (v) => `rgba(5, 5, 5, ${v * 0.8})`);
  const navBlur = useTransform(navBarOpacity, (v) => `blur(${v * 20}px)`);
  const navBorder = useTransform(navBarOpacity, (v) => `1px solid rgba(255, 255, 255, ${v * 0.05})`);

  return (
    <section className="massively-intro overflow-visible">
      {/* ── Fixed Header ── */}
      <motion.header 
        style={{ 
          background: navBg, 
          backdropFilter: navBlur,
          borderBottom: navBorder
        }}
        className="fixed top-0 left-0 right-0 h-20 z-[150] px-[5vw] flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-8 pointer-events-auto w-full">
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
              className="whitespace-nowrap"
            >
              <h1 className="shimmer-text select-none text-left">STUDYHUB</h1>
            </motion.div>
          </div>

          {/* Navigation Pill */}
          <div className="hidden lg:block">
            <LandingSectionNav />
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          {isLoggedIn ? (
            <>
              <Link href={dashboardUrl} className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white hidden sm:block whitespace-nowrap">
                Mi Panel
              </Link>
              <Link href="/quiz" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap">
                Practicar
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white whitespace-nowrap">
                Entrar
              </Link>
              <Link href="/auth/register" className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hidden sm:block whitespace-nowrap">
                Gratis
              </Link>
            </>
          )}
        </div>
      </motion.header>

      {/* ── Hero Center Content ── */}
      <div className="flex flex-col items-center justify-center relative z-10 w-full pointer-events-none pt-20">
        <motion.div style={{ opacity: heroContentOpacity }} className="mb-12">
          <p className="text-white/40 uppercase tracking-[0.4em] text-[11px] font-bold">
            Preparación Académica Superior
          </p>
        </motion.div>

        {/* Empty space where the logo starts in the middle */}
        <div className="h-[12vw] min-h-[100px]" />

        <motion.div style={{ opacity: heroContentOpacity }} className="mt-12 flex flex-col items-center">
          <p className="text-white/60 uppercase tracking-[0.2em] text-[12px] text-center px-6 mb-10">
            Domina el examen con confianza y resultados reales
          </p>

          <Link 
            href={isLoggedIn ? "/quiz" : "/auth/register"}
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-emerald-500 text-black font-black text-sm rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] pointer-events-auto"
          >
            <span>{isLoggedIn ? "Continuar Practicando" : "Comenzar Gratis Ahora"}</span>
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
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
