// =============================================================================
// StudyHub — API: Progreso de Cuestionarios (/api/quiz-progress)
// =============================================================================
// Endpoint principal para guardar, consultar y resetear el progreso del usuario.
//
// MÉTODOS:
//   GET    → Obtener todo el progreso del usuario actual (mapa categoría → score)
//   POST   → Guardar respuesta individual o resultado final de un quiz
//   DELETE → Reiniciar progreso de una categoría específica
//
// FLUJO POST (dos modos):
//   1. Granular (questionId + selectedIndex): Se guarda cada respuesta individual.
//      - Solo suma puntos si es la primera vez que responde correctamente.
//      - Recalcula el score de la categoría en base a respuestas correctas únicas.
//   2. Final (score): Se guarda al terminar el quiz completo.
//      - Suma puntos proporcionales al score (score/10).
//
// SEGURIDAD:
//   - Requiere autenticación (session.user.id).
//   - Verifica acceso a la carrera via hasCareerAccess() antes de guardar.
//   - Los puntos solo se suman una vez por pregunta correcta (anti-abuse).
//
// RESILIENCIA:
//   - El cliente tiene un sistema de cola offline (localStorage) que sincroniza
//     las respuestas cuando recupera conexión.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { updateUserStats, awardBadges } from "@/lib/services/gamification";
import { hasCareerAccess } from "@/lib/services/subscription";

// ─── GET: Obtener mapa de progreso del usuario ──────────────────────────────
// Retorna: { [categoryId]: { score, attempts } }
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await prisma.quizProgress.findMany({
    where: { userId: session.user.id },
    select: { categoryId: true, score: true, attempts: true },
  });

  // Transformar array a mapa para lookup rápido en el cliente
  const map = {};
  for (const p of progress) {
    map[p.categoryId] = { score: p.score, attempts: p.attempts };
  }
  return NextResponse.json(map);
}

// ─── POST: Guardar progreso (granular o final) ──────────────────────────────
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Parsear body con manejo de error
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { categoryId, score, questionId, selectedIndex } = body;
  const isGranularSave = questionId !== undefined;

  // Validación de campos requeridos
  if (!categoryId || (!isGranularSave && typeof score !== "number")) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  // Verificar que la categoría existe y obtener el slug de la carrera para control de acceso
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, career: { select: { slug: true } } },
  });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  // Control de acceso: verificar suscripción + carrera permitida
  if (!(await hasCareerAccess(session.user, category.career.slug))) {
    return NextResponse.json({ error: "Forbidden or Subscription Expired" }, { status: 403 });
  }

  let granularIsCorrect = false;
  let pointsAwarded = 0;

  if (isGranularSave) {
    // ── Modo granular: una respuesta individual ──
    const question = await prisma.question.findFirst({
      where: { id: questionId, categoryId },
      select: { id: true, correctIndex: true },
    });
    if (!question) return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    
    granularIsCorrect = selectedIndex === question.correctIndex;
    if (granularIsCorrect) {
      // Solo dar punto si es la PRIMERA vez que responde correctamente esta pregunta
      // (evita farming de puntos respondiendo la misma pregunta)
      const alreadyCorrect = await prisma.questionResponse.findFirst({
        where: { userId: session.user.id, questionId: question.id, isCorrect: true },
      });
      if (!alreadyCorrect) pointsAwarded = 1;
    }
  } else {
    // ── Modo final: puntaje total del quiz ──
    pointsAwarded = Math.floor(Math.round(score) / 10);
  }

  // Actualizar racha y puntos del usuario (gamificación)
  const updatedUser = await updateUserStats(session.user.id, pointsAwarded);
  if (!updatedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Guardar respuesta individual (upsert para evitar duplicados)
  if (isGranularSave) {
    await prisma.questionResponse.upsert({
      where: { userId_questionId: { userId: session.user.id, questionId } },
      update: { isCorrect: granularIsCorrect },
      create: { userId: session.user.id, questionId, isCorrect: granularIsCorrect },
    });
  }

  // Recalcular score de la categoría basado en respuestas correctas únicas
  if (!isGranularSave || granularIsCorrect) {
    const categoryQuestions = await prisma.question.findMany({ where: { categoryId }, select: { id: true } });
    const questionIds = categoryQuestions.map(q => q.id);
    const correctCount = await prisma.questionResponse.count({
      where: { userId: session.user.id, questionId: { in: questionIds }, isCorrect: true }
    });

    // Porcentaje real = (respuestas correctas únicas / total preguntas) * 100
    const calculatedScore = categoryQuestions.length > 0 ? Math.round((correctCount / categoryQuestions.length) * 100) : 0;

    // Upsert del progreso de la categoría
    await prisma.quizProgress.upsert({
      where: { userId_categoryId: { userId: session.user.id, categoryId } },
      update: {
        score: { set: calculatedScore },
        attempts: isGranularSave ? undefined : { increment: 1 },
      },
      create: { userId: session.user.id, categoryId, score: calculatedScore, attempts: 1 },
    });

    // Verificar y otorgar badges desbloqueados
    const unlockedBadges = await awardBadges(session.user.id, calculatedScore);
    return NextResponse.json({ success: true, unlockedBadges });
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE: Reiniciar progreso de una categoría ────────────────────────────
// Elimina tanto el QuizProgress como todas las QuestionResponse asociadas.
export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });

  // Eliminar registro de progreso general
  await prisma.quizProgress.deleteMany({ where: { userId: session.user.id, categoryId } });

  // Eliminar todas las respuestas individuales de preguntas de esta categoría
  const categoryQuestions = await prisma.question.findMany({ where: { categoryId }, select: { id: true } });
  await prisma.questionResponse.deleteMany({
    where: { userId: session.user.id, questionId: { in: categoryQuestions.map(q => q.id) } }
  });

  return NextResponse.json({ success: true });
}
