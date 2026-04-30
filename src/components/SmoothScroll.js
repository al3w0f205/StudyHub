// SmoothScroll — Scroll suave global usando la librería Lenis.
// Se monta una sola vez en el layout raíz. Proporciona scroll con easing
// exponencial y maneja clicks en anchor links (#hash) con offset de 100px
// para compensar la navegación sticky.
"use client";

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global click handler for hash links with offset
    const handleHashClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        const href = target.getAttribute('href');
        if (href === '#') return;
        
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          // Adjust offset for the sticky navigation
          const offset = 100; 
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
          
          lenis.scrollTo(targetPosition, {
            duration: 1.5,
          });
        }
      }
    };

    document.addEventListener('click', handleHashClick);

    return () => {
      document.removeEventListener('click', handleHashClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
