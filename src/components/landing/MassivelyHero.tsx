"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import Link from "next/link";
import LandingSectionNav from "@/app/landing-section-nav";

interface MassivelyHeroProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  brandMark: React.ReactNode;
}

export const MassivelyHero = ({ isLoggedIn, dashboardUrl, brandMark }: MassivelyHeroProps) => {
  const { scrollY } = useScroll();

  // Transformaciones basadas en el scroll
  // El logo se mueve arriba a la izquierda y se encoge
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.25]);
  const logoX = useTransform(scrollY, [0, 300], ["0%", "-41.5%"]);
  const logoY = useTransform(scrollY, [0, 300], ["0%", "-45%"]);
  
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const navBgOpacity = useTransform(scrollY, [280, 400], [0, 1]);
  const navContentOpacity = useTransform(scrollY, [300, 400], [0, 1]);

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
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `rgba(10, 10, 12, ${navBgOpacity.get()})`,
          backdropFilter: scrollY.get() > 280 ? 'blur(16px)' : 'none',
          borderBottom: scrollY.get() > 280 ? '1px solid rgba(255,255,255,0.08)' : 'none',
          opacity: navBgOpacity
        }}
      >
        <div className="flex items-center">
          {/* brandMark stays fixed in nav position but hidden until scroll? 
              Actually we let the animated logo handle the branding */}
          <div className="landing-brand" style={{ opacity: 0, pointerEvents: 'none' }}>
            {brandMark}
            <span className="landing-brand-text">StudyHub</span>
          </div>
          
          {/* This is the part that sits NEXT to the logo once it moves */}
          <motion.div style={{ opacity: navContentOpacity, marginLeft: '100px' }}>
            <LandingSectionNav />
          </motion.div>
        </div>

        <motion.div className="landing-nav-actions" style={{ opacity: navContentOpacity }}>
          {isLoggedIn ? (
            <Link href={dashboardUrl} className="landing-btn landing-btn-secondary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              Panel
            </Link>
          ) : (
            <Link href="/auth/login" className="landing-btn landing-btn-primary">
              Ingresar
            </Link>
          )}
        </motion.div>
      </motion.header>

      {/* ── Central Hero Content ── */}
      <div className="animate-fade-in" style={{ zIndex: 5, width: '100%' }}>
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
            zIndex: 150
          }}
        >
          <h1 className="shimmer-text" style={{ margin: 0, border: 'none', filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.1))' }}>
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
