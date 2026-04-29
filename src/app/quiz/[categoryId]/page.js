import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
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
  const session = await auth();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      career: { select: { id: true, name: true, slug: true } },
      questions: {
        select: { id: true, text: true, options: true, correctIndex: true, hint: true, explanation: true },
      },
    },
  });

  if (!category || category.questions.length === 0) notFound();

  // Server-side career access verification
  if (session?.user?.role !== "ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { allowedCareers: true, subscriptionExpiry: true },
    });

    const isSubActive = user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

    if (!isSubActive || !user?.allowedCareers || user.allowedCareers.trim() === "") {
      notFound(); // No access or expired subscription
    }

    const allowed = user.allowedCareers.split(",").filter(Boolean);
    if (!allowed.includes(category.career.slug)) {
      notFound(); // Not allowed for this career
    }
  }

  // Fetch all careers with categories for the sidebar navigation
  const careers = await prisma.career.findMany({
    orderBy: { name: "asc" },
    include: {
      categories: {
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  // Filter careers based on user access
  let filteredCareers = careers;
  if (session?.user?.role !== "ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { allowedCareers: true },
    });
    if (user?.allowedCareers) {
      const allowed = user.allowedCareers.split(",").filter(Boolean);
      filteredCareers = careers.filter(c => allowed.includes(c.slug));
    }
  }

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
        theory={category.theory}
        categoryName={category.name}
        careerName={category.career.name}
        careers={filteredCareers}
        currentCareerId={category.career.id}
        categoryId={categoryId}
      />
    </div>
  );
}
