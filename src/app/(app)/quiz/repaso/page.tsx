import { auth } from "@/auth";
import QuizClient from "@/components/quiz/QuizClient";
import Link from "next/link";
import { quizService } from "@/lib/services/QuizService";
import { Metadata } from "next";
import React from "react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Repaso Inteligente — StudyHub" };

export default async function RepasoPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let questions = null;
  let hasError = false;
  try {
    questions = await quizService.getFailedQuestions(session.user.id);
  } catch (error) {
    console.error("RepasoPage Error:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          ⚠️ Error de Conexión
        </h1>
        <p style={{ color: "var(--text-tertiary)" }}>
          No pudimos cargar tus preguntas de repaso.
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "4rem auto",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🏆</div>
        <h1
          style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}
        >
          ¡Estás al día!
        </h1>
        <p
          style={{
            color: "var(--text-tertiary)",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          No tienes preguntas falladas pendientes de repaso. ¡Sigue así o
          explora nuevas materias!
        </p>
        <Link href="/quiz" className="btn btn-primary">
          Ir a Cuestionarios
        </Link>
      </div>
    );
  }

  return (
    <QuizClient
      // @ts-ignore - QuizClient migration pending
      questions={questions as any}
      categoryId="repaso"
      categoryName="Repaso Inteligente"
      careerName="Personal"
      theory={null}
    />
  );
}
