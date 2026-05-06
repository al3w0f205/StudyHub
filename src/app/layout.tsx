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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ── Tema: aplicar antes del primer paint para evitar flash ──
              try {
                var storedTheme = localStorage.getItem('studyhub_theme');
                document.documentElement.setAttribute('data-theme', storedTheme || 'dark');
              } catch (e) {}

              // ── Anti-Piratería: bloquear atajos de copia y DevTools ──
              document.addEventListener('keydown', e => {
                if (
                  e.keyCode === 123 || // F12
                  (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
                  (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                  (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                  (e.ctrlKey && e.keyCode === 80) || // Ctrl+P
                  (e.ctrlKey && e.keyCode === 67)    // Ctrl+C
                ) {
                  e.preventDefault();
                  return false;
                }
              });
            `,
          }}
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
      </head>
      <body>
        <SmoothScroll />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
