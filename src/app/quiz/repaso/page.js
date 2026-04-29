import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import QuizClient from "@/components/quiz/QuizClient";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Repaso Inteligente — StudyHub" };

export default async function RepasoPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // We'll let the client-side handle the fetch or pass it from here.
  // Actually, fetching from server-side is more stable.
  
  // Logic from /api/repaso/route.js but here to pass to QuizClient
  const failedResponses = await prisma.questionResponse.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const latestStatus = {};
  failedResponses.forEach(r => {
    if (!(r.questionId in latestStatus)) {
      latestStatus[r.questionId] = r.isCorrect;
    }
  });

  const failedIds = Object.keys(latestStatus).filter(id => latestStatus[id] === false);

  if (failedIds.length === 0) {
    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", textAlign: "center", padding: "2rem" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🏆</div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "1rem" }}>¡Estás al día!</h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "2rem", lineHeight: 1.6 }}>
          No tienes preguntas falladas pendientes de repaso. ¡Sigue así o explora nuevas materias!
        </p>
        <Link href="/quiz" className="btn btn-primary">Ir a Cuestionarios</Link>
      </div>
    );
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: failedIds } },
    include: {
      category: {
        select: { name: true, career: { select: { name: true } } }
      }
    }
  });

  // Shuffle
  const shuffled = questions.sort(() => 0.5 - Math.random());

  return (
    <QuizClient 
      questions={shuffled} 
      categoryId="repaso" 
      categoryName="Repaso Inteligente"
      careerName="Personal"
      theory={null}
    />
  );
}
