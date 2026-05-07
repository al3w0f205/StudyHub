"use client";

import { motion } from "framer-motion";
import React from "react";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
}

export const Reveal = ({ children, width = "100%", delay = 0.2 }: RevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      style={{ width }}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxBg = ({ imageUrl }: { imageUrl: string }) => {
  return (
    <motion.div
      className="massively-bg"
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 2 }}
      style={{
        backgroundImage: `url(${imageUrl})`,
        y: typeof window !== "undefined" ? "0%" : "0%" // Placeholder for hydration
      }}
    />
  );
};
