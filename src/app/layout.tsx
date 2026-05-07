import "./globals.css";
import "katex/dist/katex.min.css";
import { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import SmoothScroll from "@/components/SmoothScroll";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "StudyHub — Plataforma de Estudio Interactivo",
    template: "%s | StudyHub",
  },
  description:
    "Prepárate para tus exámenes universitarios con cuestionarios interactivos organizados por carrera. Miles de preguntas con explicaciones detalladas.",
  keywords: [
    "estudiar",
    "universidad",
    "cuestionarios",
    "exámenes",
    "medicina",
    "derecho",
    "ingeniería",
    "preguntas",
  ],
  authors: [{ name: "StudyHub" }],
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
      </head>
      <body>
        <SmoothScroll />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
