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

  // Logo migration: Center -> Top Left
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.28]);
  const logoX = useTransform(scrollY, [0, 300], ["0%", "-43%"]);
  const logoY = useTransform(scrollY, [0, 300], ["0%", "-44.5%"]);
  
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const navBgOpacity = useTransform(scrollY, [200, 300], [0, 1]);
  const navContentOpacity = useTransform(scrollY, [250, 320], [0, 1]);
  const navBg = useTransform(navBgOpacity, (v) => `rgba(5, 5, 5, ${v})`);
  const navBlur = useTransform(scrollY, [200, 300], ["blur(0px)", "blur(20px)"]);
  const navBorder = useTransform(scrollY, [200, 300], ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.08)"]);

  return (
    <section className="massively-intro" style={{ perspective: "1000px" }}>
      {/* ── Fixed Premium Navigation Bar ── */}
      <motion.header 
        className="landing-shell landing-nav" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5vw',
          background: navBg,
          backdropFilter: navBlur,
          borderBottom: navBorder,
          opacity: navBgOpacity
        }}
      >
        <div className="flex items-center gap-8">
          {/* brandMark placeholder for spacing */}
          <div className="landing-brand" style={{ opacity: 0, pointerEvents: 'none', width: '180px' }}>
            <span className="landing-brand-text">StudyHub</span>
          </div>
          
          <motion.div style={{ opacity: navContentOpacity }}>
            <LandingSectionNav />
          </motion.div>
        </div>

        <motion.div 
          className="flex items-center gap-3" 
          style={{ opacity: navContentOpacity }}
        >
          {isLoggedIn ? (
            <>
              <Link 
                href={dashboardUrl} 
                className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white max-lg:hidden"
              >
                Panel de Estudio
              </Link>
              <Link 
                href="/quiz" 
                className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Practicar Ahora
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="px-5 py-2 rounded-full text-[13px] font-bold transition-all border border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                Ingresar
              </Link>
              <Link 
                href="/auth/register" 
                className="px-5 py-2 rounded-full text-[13px] font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Prueba Gratis
              </Link>
            </>
          )}
        </motion.div>
      </motion.header>

      {/* ── Central Hero Content ── */}
      <div className="animate-fade-in" style={{ zIndex: 5, width: '100%', pointerEvents: 'none' }}>
        <motion.div style={{ opacity: headerOpacity }}>
          <p style={{ letterSpacing: '0.4em', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
            Preparación Universitaria
          </p>
        </motion.div>

        <motion.div
          style={{
            scale: logoScale,
            x: logoX,
            y: logoY,
            position: 'relative',
            zIndex: 150,
            pointerEvents: 'auto'
          }}
        >
          <h1 className="shimmer-text" style={{ margin: 0, border: 'none', cursor: 'default' }}>
            STUDYHUB
          </h1>
        </motion.div>

        <motion.div style={{ opacity: headerOpacity, marginTop: '1.5rem' }}>
          <div style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 auto 1.5rem' }} />
          <p style={{ letterSpacing: '0.25em', opacity: 0.5, textTransform: 'uppercase', fontSize: '0.85rem' }}>
            Llega seguro al examen
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        style={{ position: 'absolute', bottom: '4rem', zIndex: 5, opacity: headerOpacity }}
      >
        <div className="scroll-indicator-v2" />
      </motion.div>
    </section>
  );
};
