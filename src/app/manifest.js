export default function manifest() {
  return {
    name: "StudyHub — Plataforma de Estudio",
    short_name: "StudyHub",
    description:
      "Prepárate para tus exámenes universitarios con cuestionarios interactivos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    categories: ["education"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
