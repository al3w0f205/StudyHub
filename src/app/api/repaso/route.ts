import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { quizService } from "@/lib/services/QuizService";
import logger from "@/lib/logger";

/**
 * GET /api/repaso
 * Retorna preguntas que el usuario falló en su intento más reciente.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const questions = await quizService.getFailedQuestions(session.user.id);
    return NextResponse.json({ questions });
  } catch (error) {
    logger.error({ error, userId: session.user.id }, "Failed to fetch failed questions");
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
