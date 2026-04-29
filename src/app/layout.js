import "./globals.css";

export const metadata = {
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyHub",
  },
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({ children }) {
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
              try {
                var storedTheme = localStorage.getItem('studyhub_theme');
                if (storedTheme) {
                  document.documentElement.setAttribute('data-theme', storedTheme);
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}

              // Anti-Piracy Protection
              document.addEventListener('contextmenu', e => e.preventDefault());
              document.addEventListener('keydown', e => {
                if (
                  e.keyCode === 123 || // F12
                  (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
                  (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                  (e.ctrlKey && e.keyCode === 83) || // Ctrl+S
                  (e.ctrlKey && e.keyCode === 80) || // Ctrl+P
                  (e.ctrlKey && e.keyCode === 67)    // Ctrl+C (as fallback)
                ) {
                  e.preventDefault();
                  return false;
                }
              });
              // Service Worker Registration
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered');
                  }, function(err) {
                    console.log('SW failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
