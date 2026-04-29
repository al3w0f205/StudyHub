import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/quiz-progress — Get all progress for the current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.quizProgress.findMany({
    where: { userId: session.user.id },
    select: { categoryId: true, score: true, attempts: true },
  });

  // Convert to { [categoryId]: { score, attempts } }
  const map = {};
  for (const p of progress) {
    map[p.categoryId] = { score: p.score, attempts: p.attempts };
  }

  return NextResponse.json(map);
}

// POST /api/quiz-progress — Save/update progress for a category
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { categoryId, score } = body;
  if (!categoryId || typeof score !== "number" || score < 0 || score > 100) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }


  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, career: { select: { slug: true } } },
  });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { allowedCareers: true, subscriptionExpiry: true },
    });
    const isSubActive = user?.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();
    const allowedCareers = user?.allowedCareers?.split(",").filter(Boolean) ?? [];

    if (!isSubActive || !allowedCareers.includes(category.career.slug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Upsert: update if exists, create if not. Keep best score.
  const existing = await prisma.quizProgress.findUnique({
    where: {
      userId_categoryId: {
        userId: session.user.id,
        categoryId,
      },
    },
  });

  if (existing) {
    await prisma.quizProgress.update({
      where: { id: existing.id },
      data: {
        score: Math.max(existing.score, score),
        attempts: existing.attempts + 1,
      },
    });
  } else {
    await prisma.quizProgress.create({
      data: {
        userId: session.user.id,
        categoryId,
        score,
        attempts: 1,
      },
    });
  }

  return NextResponse.json({ success: true });
}
