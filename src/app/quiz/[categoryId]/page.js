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

  const allCategories = await prisma.category.findMany({
    where: { careerId: category.careerId },
    select: { id: true, name: true }
  });

  // Shuffle questions and options
  const shuffled = [...category.questions].sort(() => Math.random() - 0.5).map(q => {
    const optsWithOriginals = q.options.map((text, i) => ({ text, isCorrect: i === q.correctIndex }));
    const shuffledOpts = optsWithOriginals.sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOpts.findIndex(o => o.isCorrect);
    return {
      ...q,
      options: shuffledOpts.map(o => o.text),
      correctIndex: newCorrectIndex
    };
  });

  return (
    <div>
      <QuizClient
        questions={shuffled}
        categoryName={category.name}
        careerName={category.career.name}
        allCategories={allCategories}
        categoryId={categoryId}
      />
    </div>
  );
}
