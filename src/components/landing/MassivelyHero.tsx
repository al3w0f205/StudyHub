"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import Link from "next/link";

interface MassivelyHeroProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  brandMark: React.ReactNode;
}

export const MassivelyHero = ({ isLoggedIn, dashboardUrl, brandMark }: MassivelyHeroProps) => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  // Transformaciones basadas en el scroll
  // El logo se mueve arriba a la izquierda y se encoge
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.25]);
  const logoX = useTransform(scrollY, [0, 300], ["0%", "-42%"]);
  const logoY = useTransform(scrollY, [0, 300], ["0%", "-45%"]);
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const navBgOpacity = useTransform(scrollY, [280, 400], [0, 1]);

  return (
    <section ref={containerRef} className="massively-intro" style={{ perspective: "1000px" }}>
      {/* ── Desktop Navigation (Fades in on scroll) ── */}
      <motion.header 
        className="landing-shell landing-nav" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          background: `rgba(10, 10, 12, ${navBgOpacity.get()})`,
          backdropFilter: scrollY.get() > 280 ? 'blur(10px)' : 'none',
          borderBottom: scrollY.get() > 280 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          opacity: navBgOpacity
        }}
      >
        <div className="landing-brand" style={{ visibility: 'hidden' }}>
          {brandMark}
          <span className="landing-brand-text">StudyHub</span>
        </div>
        <div className="landing-nav-actions">
          {isLoggedIn ? (
            <Link href={dashboardUrl} className="landing-btn landing-btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              Panel
            </Link>
          ) : (
            <Link href="/auth/login" className="landing-btn landing-btn-primary">
              Ingresar
            </Link>
          )}
        </div>
      </motion.header>

      {/* ── Central Hero Content ── */}
      <div className="animate-fade-in" style={{ zIndex: 5, width: '100%' }}>
        <motion.div style={{ opacity: headerOpacity }}>
          <p style={{ letterSpacing: '0.4em', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.9rem' }}>
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
          <h1 className="shimmer-text" style={{ margin: 0, border: 'none' }}>
            STUDYHUB
          </h1>
        </motion.div>

        <motion.div style={{ opacity: headerOpacity, marginTop: '1.5rem' }}>
          <div style={{ width: '100px', height: '2px', background: 'white', margin: '0 auto 1.5rem' }} />
          <p style={{ letterSpacing: '0.25em', opacity: 0.7, textTransform: 'uppercase', fontSize: '0.85rem' }}>
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
