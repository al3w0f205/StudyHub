import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizClient from "@/components/quiz/QuizClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { categoryId } = await params;
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { career: { select: { name: true } } },
  });
  if (!category) return { title: "Cuestionario" };
  return { title: `${category.name} — ${category.career.name}` };
}

export default async function QuizPage({ params }) {
  const { categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      career: { select: { name: true } },
      questions: {
        select: { id: true, text: true, options: true, correctIndex: true, hint: true, explanation: true },
      },
    },
  });

  if (!category || category.questions.length === 0) notFound();

  // Shuffle questions
  const shuffled = [...category.questions].sort(() => Math.random() - 0.5);

  return (
    <div>
      <QuizClient
        questions={shuffled}
        categoryName={category.name}
        careerName={category.career.name}
      />
    </div>
  );
}
