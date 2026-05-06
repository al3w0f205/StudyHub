// =============================================================================
// StudyHub — API: Analytics de Usuario (/api/user/analytics)
// =============================================================================
// Genera datos de rendimiento por categoría para el radar de competencias.
// Retorna un array de { name, value } donde value es el % de aciertos (0-100).
// Limitado a las 6 mejores categorías para un radar visual limpio.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET /api/user/analytics — Datos agregados para el radar de competencias. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener todas las respuestas del usuario con info de categoría
    const responses = await prisma.questionResponse.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Agregar estadísticas por categoría (correctas / total)
    const stats: Record<string, { name: string; correct: number; total: number }> =
      {};
    responses.forEach((r) => {
      const cat = r.question.category;
      if (!cat) return;
      if (!stats[cat.id]) {
        stats[cat.id] = { name: cat.name, correct: 0, total: 0 };
      }
      stats[cat.id].total += 1;
      if (r.isCorrect) stats[cat.id].correct += 1;
    });

    // Formatear para el radar: [{ name, value }] con value 0-100
    const chartData = Object.values(stats).map((s) => ({
      name: s.name,
      value: Math.round((s.correct / s.total) * 100),
    }));

    // Limitar a top 6 categorías (ordenadas por mejor rendimiento)
    const limitedData = chartData.sort((a, b) => b.value - a.value).slice(0, 6);

    return NextResponse.json({ data: limitedData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
