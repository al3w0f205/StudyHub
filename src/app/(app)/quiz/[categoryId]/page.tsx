import { notFound } from "next/navigation";
import { auth } from "@/auth";
import QuizClient from "@/components/quiz/QuizClient";
import { quizService } from "@/lib/services/QuizService";
import { userService } from "@/lib/services/UserService";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import React from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { career: { select: { name: true } } },
  });
  if (!category) return { title: "Cuestionario" };
  return { title: `${category.name} — ${category.career.name}` };
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  let quizData = null;
  let filteredCareers: any[] = [];
  let isAdmin = false;
  let hasError = false;

  try {
    // 1. Verify Access
    isAdmin = session.user.role === "ADMIN";
    const user = await userService.getUserProfile(session.user.id);
    if (!user) notFound();

    const isSubActive =
      user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

    if (!isAdmin) {
      if (!isSubActive || !user.allowedCareers || user.allowedCareers.trim() === "") {
        notFound();
      }
    }

    // 2. Fetch Data via Service
    quizData = await quizService.getQuizData(
      categoryId,
      session.user.id,
      isAdmin
    );

    if (!quizData || (quizData.questions.length === 0 && !quizData.category.theory)) {
      notFound();
    }

    // Verify career access for regular users
    if (!isAdmin) {
      const allowed = user.allowedCareers?.split(",").filter(Boolean) ?? [];
      if (!allowed.includes(quizData.category.career.slug)) {
        notFound();
      }
    }

    // 3. Fetch Sidebar Data (Careers & Categories)
    const careers = await prisma.career.findMany({
      orderBy: { name: "asc" },
      include: {
        categories: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
    });

    filteredCareers = careers;
    if (!isAdmin) {
      const allowed = user.allowedCareers?.split(",").filter(Boolean) ?? [];
      filteredCareers = careers.filter((c) => allowed.includes(c.slug));
    }
  } catch (error) {
    console.error("QuizPage Error:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          ⚠️ Error de Conexión
        </h1>
        <p
          style={{
            color: "var(--text-tertiary)",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          No pudimos conectar con la base de datos. Por favor, verifica que el
          servidor de base de datos esté funcionando e inténtalo de nuevo.
        </p>
      </div>
    );
  }

  if (!quizData) return null;

  return (
    <div>
      {/* @ts-ignore - QuizClient migration pending */}
      <QuizClient
        questions={quizData.questions}
        theory={quizData.category.theory}
        categoryName={quizData.category.name}
        careerName={quizData.category.career.name}
        careers={filteredCareers}
        currentCareerId={quizData.category.career.id}
        categoryId={categoryId}
        totalQuestionsInCategory={quizData.totalQuestionsInCategory}
        initialCompletedCount={quizData.initialCompletedCount}
        isAdmin={isAdmin}
      />
    </div>
  );
}
