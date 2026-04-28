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
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
