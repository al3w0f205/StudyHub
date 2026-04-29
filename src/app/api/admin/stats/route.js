import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // 1. General Stats
    const [totalUsers, totalQuestions, approvedPayments, pendingPayments, errorReports] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.paymentRequest.count({ where: { status: "APPROVED" } }),
      prisma.paymentRequest.count({ where: { status: "PENDING" } }),
      prisma.errorReport.count({ where: { status: "PENDING" } }),
    ]);

    // 2. Revenue History (Approved payments per day, last 30 days)
    const payments = await prisma.paymentRequest.findMany({
      where: {
        status: "APPROVED",
        reviewedAt: { gte: thirtyDaysAgo },
      },
      select: { reviewedAt: true },
    });

    const revenueMap = {};
    payments.forEach(p => {
      const date = p.reviewedAt.toISOString().slice(0, 10);
      revenueMap[date] = (revenueMap[date] || 0) + 10; // $10 per payment
    });

    const revenueHistory = Object.entries(revenueMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. User Growth (New users per day, last 30 days)
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const growthMap = {};
    newUsers.forEach(u => {
      const date = u.createdAt.toISOString().slice(0, 10);
      growthMap[date] = (growthMap[date] || 0) + 1;
    });

    const userGrowth = Object.entries(growthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 4. Activity (Question responses per day, last 7 days)
    const responses = await prisma.questionResponse.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const activityMap = {};
    responses.forEach(r => {
      const date = r.createdAt.toISOString().slice(0, 10);
      activityMap[date] = (activityMap[date] || 0) + 1;
    });

    const activityHistory = Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 5. Most failed categories (Top 5)
    // This is more complex, let's just get the count of isCorrect: false per category
    const failedResponses = await prisma.questionResponse.findMany({
      where: { isCorrect: false },
      include: { question: { select: { categoryId: true } } },
      take: 1000, // Limit to recent
    });

    const failedMap = {};
    failedResponses.forEach(r => {
      const catId = r.question.categoryId;
      failedMap[catId] = (failedMap[catId] || 0) + 1;
    });

    const categoryIds = Object.keys(failedMap);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const failedRanking = categories.map(c => ({
      name: c.name,
      failures: failedMap[c.id]
    })).sort((a, b) => b.failures - a.failures).slice(0, 5);

    return NextResponse.json({
      summary: {
        totalUsers,
        totalQuestions,
        revenue: approvedPayments * 10,
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
