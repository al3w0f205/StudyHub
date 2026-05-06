import React from "react";

export const LANDING_STATS_TIMEOUT_MS = 2500;
export const IS_PREVIEW_MODE = process.env.STUDYHUB_PREVIEW_MODE === "true";

export const previewCareersData = [
  { name: "Medicina", categories: [{ _count: { questions: 420 } }, { _count: { questions: 280 } }] },
  { name: "Ingeniería", categories: [{ _count: { questions: 260 } }, { _count: { questions: 180 } }] },
  { name: "Derecho", categories: [{ _count: { questions: 150 } }] },
];

export const features = [
  {
    icon: "target",
    title: "Simulador de Examen Real",
    description:
      "Entrena con presión de tiempo y modo enfoque para simular la experiencia real del examen universitario.",
  },
  {
    icon: "explain",
    title: "Flashcards Interactivos",
    description:
      "Usa el modo de tarjetas para estudiar conceptos clave con active recall y explicaciones instantáneas.",
  },
  {
    icon: "progress",
    title: "Gamificación y Rachas",
    description:
      "Gana puntos, desbloquea medallas y mantén tu racha diaria para convertir el estudio en un hábito divertido.",
  },
  {
    icon: "mobile",
    title: "PWA: Instálalo en tu Celular",
    description:
      "Accede instantáneamente desde tu pantalla de inicio como una app nativa, incluso sin conexión en algunas áreas.",
  },
];

export const steps = [
  {
    step: "01",
    title: "Elige tu ruta",
    description:
      "Selecciona tu carrera y entra directo al contenido que corresponde a tu semestre o materia.",
  },
  {
    step: "02",
    title: "Responde con intención",
    description:
      "Practica preguntas reales, revisa alternativas y entrena con el ritmo que mejor se ajuste a tu día.",
  },
  {
    step: "03",
    title: "Corrige y refuerza",
    description:
      "Usa las explicaciones para convertir errores en memoria útil antes de volver a intentar.",
  },
];

export const faqs = [
  {
    q: "¿Cómo se actualizan las preguntas?",
    a: "El banco de preguntas se revisa y amplía continuamente. Si encuentras un error, puedes reportarlo para que el equipo lo corrija.",
  },
  {
    q: "¿Cómo funciona el acceso pagado?",
    a: "El pago se valida de forma manual. Envías tu comprobante y un administrador activa tu cuenta y las carreras solicitadas.",
  },
  {
    q: "¿Puedo estudiar desde el celular?",
    a: "Sí. StudyHub está pensado para funcionar bien en móvil, con sesiones cortas, lectura clara y navegación simple.",
  },
  {
    q: "¿Qué pasa si mi carrera no está disponible?",
    a: "Puedes sugerir nuevas carreras o colaborar con material. La plataforma está preparada para crecer por áreas y categorías.",
  },
];

export const Icon = ({ name }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "target") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  }

  if (name === "explain") {
    return (
      <svg {...common}>
        <path d="M4 19.5V5a2 2 0 0 1 2-2h11" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
        <path d="M6 21h12a2 2 0 0 0 2-2V7" />
      </svg>
    );
  }

  if (name === "progress") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 3 3 5-7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
};
