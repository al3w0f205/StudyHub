// =============================================================================
// StudyHub — API Admin: Estadísticas del Dashboard (/api/admin/stats)
// =============================================================================
// Genera datos agregados para el panel de administración. Solo accesible por ADMIN.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/stats
 * Retorna estadísticas completas para el dashboard de administración.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // ── 1. Contadores generales (consultas en paralelo para velocidad) ──
    const [
      totalUsers,
      totalQuestions,
      approvedPayments,
      pendingPayments,
      errorReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.paymentRequest.count({ where: { status: "APPROVED" } }),
      prisma.paymentRequest.count({ where: { status: "PENDING" } }),
      prisma.errorReport.count({ where: { status: "PENDING" } }),
    ]);

    // ── 2. Historial de ingresos (pagos aprobados por día, últimos 30 días) ──
    const payments = await prisma.paymentRequest.findMany({
      where: {
        status: "APPROVED",
        reviewedAt: { gte: thirtyDaysAgo },
      },
      select: { reviewedAt: true },
    });

    // Agrupar pagos por fecha y sumar $10 por cada uno
    const revenueMap: Record<string, number> = {};
    payments.forEach((p) => {
      if (!p.reviewedAt) return;
      const date = p.reviewedAt.toISOString().slice(0, 10);
      revenueMap[date] = (revenueMap[date] || 0) + 10;
    });

    const revenueHistory = Object.entries(revenueMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── 3. Crecimiento de usuarios (nuevos por día, últimos 30 días) ──
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const growthMap: Record<string, number> = {};
    newUsers.forEach((u) => {
      const date = u.createdAt.toISOString().slice(0, 10);
      growthMap[date] = (growthMap[date] || 0) + 1;
    });

    const userGrowth = Object.entries(growthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── 4. Actividad reciente (respuestas por día, últimos 7 días) ──
    const responses = await prisma.questionResponse.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const activityMap: Record<string, number> = {};
    responses.forEach((r) => {
      const date = r.createdAt.toISOString().slice(0, 10);
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    const activityHistory = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── 5. Ranking de categorías más falladas (Top 5) ──
    const failedResponses = await prisma.questionResponse.findMany({
      where: { isCorrect: false },
      include: { question: { select: { categoryId: true } } },
      take: 1000,
    });

    const failedMap: Record<string, number> = {};
    failedResponses.forEach((r) => {
      const catId = r.question?.categoryId;
      if (!catId) return;
      failedMap[catId] = (failedMap[catId] || 0) + 1;
    });

    // Obtener nombres de las categorías
    const categoryIds = Object.keys(failedMap);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const failedRanking = categories
      .map((c) => ({
        name: c.name,
        failures: failedMap[c.id],
      }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 5);

    // ── Respuesta final ──
    return NextResponse.json({
      summary: {
        totalUsers,
        totalQuestions,
        revenue: approvedPayments * 10, // $10 por pago aprobado
        pendingPayments,
        errorReports,
      },
      revenueHistory,
      userGrowth,
      activityHistory,
      failedRanking,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
