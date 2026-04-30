// =============================================================================
// StudyHub — API: Repaso Inteligente (/api/repaso)
// =============================================================================
// Retorna las preguntas que el usuario respondió incorrectamente en su última
// sesión de cada pregunta. Permite al usuario practicar sus puntos débiles.
//
// LÓGICA:
//   1. Obtener TODAS las respuestas del usuario, ordenadas por fecha (más reciente primero).
//   2. Para cada pregunta, quedarse solo con la respuesta MÁS RECIENTE.
//   3. Filtrar solo las que están marcadas como incorrectas (isCorrect: false).
//   4. Cargar los datos completos de esas preguntas (con categoría y carrera).
//   5. Mezclar aleatoriamente para variedad en el repaso.
//
// NOTA DE RENDIMIENTO:
//   Actualmente carga todas las respuestas del usuario y filtra en JS.
//   Para usuarios con muchas respuestas, considerar usar una consulta SQL
//   con DISTINCT ON (questionId) ORDER BY createdAt DESC.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    // Paso 1: Obtener todas las respuestas del usuario (más recientes primero)
    const failedResponses = await prisma.questionResponse.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Paso 2: Quedarse solo con el estado MÁS RECIENTE de cada pregunta
    // (la primera aparición en el array ya es la más reciente por el orderBy)
    const latestStatus = {};
    failedResponses.forEach(r => {
      if (!(r.questionId in latestStatus)) {
        latestStatus[r.questionId] = r.isCorrect;
      }
    });

    // Paso 3: Filtrar solo las preguntas cuyo último intento fue incorrecto
    const failedIds = Object.keys(latestStatus).filter(id => latestStatus[id] === false);

    if (failedIds.length === 0) {
      return NextResponse.json({ questions: [] });
    }

    // Paso 4: Cargar datos completos de las preguntas falladas
    const questions = await prisma.question.findMany({
      where: { id: { in: failedIds } },
      include: {
        category: {
          select: { name: true, career: { select: { name: true } } }
        }
      }
    });

    // Paso 5: Mezclar aleatoriamente (Fisher-Yates simplificado)
    const shuffled = questions.sort(() => 0.5 - Math.random());

    return NextResponse.json({ questions: shuffled });
  } catch (error) {
    console.error("Error fetching failed questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
