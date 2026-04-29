import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all failed responses for this user
    // We want unique questions that are CURRENTLY marked as failed (not corrected in a later session)
    // Actually, a simpler approach for MVP: get questions where the LAST response was incorrect.
    
    const failedResponses = await prisma.questionResponse.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Filter to get unique questions where the latest response is isCorrect: false
    const latestStatus = {};
    failedResponses.forEach(r => {
      if (!(r.questionId in latestStatus)) {
        latestStatus[r.questionId] = r.isCorrect;
      }
    });

    const failedIds = Object.keys(latestStatus).filter(id => latestStatus[id] === false);

    if (failedIds.length === 0) {
      return NextResponse.json({ questions: [] });
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

    return NextResponse.json({ questions: shuffled });
  } catch (error) {
    console.error("Error fetching failed questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
