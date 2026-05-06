"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global click handler for hash links with offset
    const handleHashClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (target) {
        const href = target.getAttribute("href");
        if (href === "#") return;

        const targetElement = document.querySelector(href as string);
        if (targetElement) {
          e.preventDefault();
          // Adjust offset for the sticky navigation
          const offset = 100;
          const targetPosition =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset -
            offset;

          lenis.scrollTo(targetPosition, {
            duration: 1.5,
          });
        }
      }
    };

    document.addEventListener("click", handleHashClick);

    return () => {
      document.removeEventListener("click", handleHashClick as any);
      lenis.destroy();
    };
  }, []);

  return null;
}
