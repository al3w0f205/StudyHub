// =============================================================================
// StudyHub — API Admin: Estadísticas del Dashboard (/api/admin/stats)
// =============================================================================
// Genera datos agregados para el panel de administración. Solo accesible por ADMIN.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

/**
 * Cached function to get dashboard summary counts
 */
const getCachedSummary = unstable_cache(
  async () => {
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

    return {
      totalUsers,
      totalQuestions,
      revenue: approvedPayments * 10,
      pendingPayments,
      errorReports,
    };
  },
  ["admin-stats-summary"],
  { revalidate: 300, tags: ["admin-stats"] }
);

/**
 * Cached function to get charts data
 */
const getCachedCharts = unstable_cache(
  async (thirtyDaysAgo: Date, sevenDaysAgo: Date) => {
    const [payments, newUsers, responses] = await Promise.all([
      prisma.paymentRequest.findMany({
        where: { status: "APPROVED", reviewedAt: { gte: thirtyDaysAgo } },
        select: { reviewedAt: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.questionResponse.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
    ]);

    // Process Revenue History
    const revenueMap: Record<string, number> = {};
    payments.forEach((p) => {
      if (!p.reviewedAt) return;
      const date = p.reviewedAt.toISOString().slice(0, 10);
      revenueMap[date] = (revenueMap[date] || 0) + 10;
    });
    const revenueHistory = Object.entries(revenueMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process User Growth
    const growthMap: Record<string, number> = {};
    newUsers.forEach((u) => {
      const date = u.createdAt.toISOString().slice(0, 10);
      growthMap[date] = (growthMap[date] || 0) + 1;
    });
    const userGrowth = Object.entries(growthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Process Activity History
    const activityMap: Record<string, number> = {};
    responses.forEach((r) => {
      const date = r.createdAt.toISOString().slice(0, 10);
      activityMap[date] = (activityMap[date] || 0) + 1;
    });
    const activityHistory = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { revenueHistory, userGrowth, activityHistory };
  },
  ["admin-stats-charts"],
  { revalidate: 600, tags: ["admin-stats"] }
);

/**
 * Cached function to get failed ranking
 */
const getCachedFailedRanking = unstable_cache(
  async () => {
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

    const categoryIds = Object.keys(failedMap);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    return categories
      .map((c) => ({
        name: c.name,
        failures: failedMap[c.id],
      }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 5);
  },
  ["admin-stats-failed-ranking"],
  { revalidate: 3600, tags: ["admin-stats"] }
);

/**
 * GET /api/admin/stats
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
    const [summary, charts, failedRanking] = await Promise.all([
      getCachedSummary(),
      getCachedCharts(thirtyDaysAgo, sevenDaysAgo),
      getCachedFailedRanking(),
    ]);

    return NextResponse.json({
      summary,
      ...charts,
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
