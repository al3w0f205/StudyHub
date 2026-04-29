import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import QuizClient from "@/components/quiz/QuizClient";

export const dynamic = "force-dynamic";

function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seedValue) {
  const random = seededRandom(hashSeed(seedValue));
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

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

  if (!category || (category.questions.length === 0 && !category.theory)) notFound();

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

  // Fetch user responses for these questions to filter completed ones
  const userResponses = await prisma.questionResponse.findMany({
    where: { 
      userId: session.user.id,
      questionId: { in: category.questions.map(q => q.id) }
    },
    orderBy: { createdAt: "desc" }
  });

  // Determine completed questions (where the latest response is correct)
  const latestStatus = {};
  userResponses.forEach(r => {
    if (!(r.questionId in latestStatus)) {
      latestStatus[r.questionId] = r.isCorrect;
    }
  });

  const completedQuestionIds = Object.keys(latestStatus).filter(id => latestStatus[id] === true);
  const totalQuestionsInCategory = category.questions.length;
  
  // Filter questions to show only pending/incorrect ones
  const pendingQuestions = category.questions.filter(q => !completedQuestionIds.includes(q.id));

  const { encodeForensic } = await import("@/lib/forensic");

  const shuffled = seededShuffle(pendingQuestions, quizSeed).map((question) => {
    const options = question.options.map((text, index) => ({
      text,
      isCorrect: index === question.correctIndex,
    }));
    const shuffledOptions = seededShuffle(options, `${quizSeed}:${question.id}`);

    // Inject invisible forensic watermark
    const watermarkedText = encodeForensic(question.text, session.user.id);
    const watermarkedExplanation = question.explanation 
      ? encodeForensic(question.explanation, session.user.id) 
      : null;

    return {
      ...question,
      text: watermarkedText,
      explanation: watermarkedExplanation,
      options: shuffledOptions.map((option) => option.text),
      correctIndex: shuffledOptions.findIndex((option) => option.isCorrect),
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
        totalQuestionsInCategory={totalQuestionsInCategory}
        initialCompletedCount={completedQuestionIds.length}
        isAdmin={session?.user?.role === "ADMIN"}
      />
    </div>
  );
}
