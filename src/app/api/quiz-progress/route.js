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

  const { categoryId, score, questionId, selectedIndex } = body;
  const isGranularSave = questionId !== undefined;

  if (!categoryId || (!isGranularSave && typeof score !== "number")) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  if (!isGranularSave && (!Number.isFinite(score) || score < 0 || score > 100)) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }
  if (isGranularSave && !Number.isInteger(selectedIndex)) {
    return NextResponse.json({ error: "Invalid selectedIndex" }, { status: 400 });
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

  let normalizedScore = typeof score === "number" ? Math.round(score) : null;
  let granularIsCorrect = false;
  let pointsAwarded = 0;

  // Granular validation: question must belong to the category.
  if (isGranularSave) {
    const question = await prisma.question.findFirst({
      where: { id: questionId, categoryId },
      select: { id: true, correctIndex: true },
    });
    if (!question) {
      return NextResponse.json({ error: "Invalid question for category" }, { status: 400 });
    }
    granularIsCorrect = selectedIndex === question.correctIndex;
    if (granularIsCorrect) {
      const alreadyCorrect = await prisma.questionResponse.findFirst({
        where: {
          userId: session.user.id,
          questionId: question.id,
          isCorrect: true,
        },
        select: { id: true },
      });
      if (!alreadyCorrect) {
        pointsAwarded = 1;
      }
    }
  } else if (normalizedScore !== null) {
    pointsAwarded = Math.floor(normalizedScore / 10);
  }

  // --- Gamification Logic ---
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streak: true, lastActive: true, totalPoints: true }
  });

  if (user) {
    const now = new Date();
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    let newStreak = user.streak;
    
    if (!lastActive) {
      newStreak = 1;
    } else {
      const diffTime = Math.abs(now.setHours(0,0,0,0) - lastActive.setHours(0,0,0,0));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // if diffDays === 0, streak stays same
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streak: newStreak,
        lastActive: new Date(),
        totalPoints: { increment: pointsAwarded }
      }
    });
    // Save only validated single-question attempts (prevents forged batch writes).
    if (isGranularSave) {
      await prisma.questionResponse.create({
        data: {
          userId: session.user.id,
          questionId,
          isCorrect: granularIsCorrect,
        },
      });
    }
    // ------------------------------------------

    // --- Badge Awarding ---
    try {
      const allBadges = await prisma.badge.findMany();
      const existingUserBadges = await prisma.userBadge.findMany({
        where: { userId: session.user.id },
        select: { badge: { select: { slug: true } } }
      });
      const earnedSlugs = existingUserBadges.map(ub => ub.badge.slug);

      const badgesToAward = [];
      // --- Badge logic checks ---
      
      // 1. First Quiz
      if (!earnedSlugs.includes("first_quiz")) {
        badgesToAward.push("first_quiz");
      }

      // 2. Streaks
      if (newStreak >= 3 && !earnedSlugs.includes("streak_3")) {
        badgesToAward.push("streak_3");
      }
      if (newStreak >= 7 && !earnedSlugs.includes("streak_7")) {
        badgesToAward.push("streak_7");
      }

      // 3. Perfect Score
      if (normalizedScore === 100 && !earnedSlugs.includes("score_100")) {
        badgesToAward.push("score_100");
      }

      // 4. Points
      const totalPoints = user.totalPoints + pointsAwarded;
      if (totalPoints >= 1000 && !earnedSlugs.includes("points_1000")) {
        badgesToAward.push("points_1000");
      }
      if (totalPoints >= 5000 && !earnedSlugs.includes("points_5000")) {
        badgesToAward.push("points_5000");
      }

      // 5. Quiz counts (different categories completed)
      const existingRecord = await prisma.quizProgress.findUnique({
        where: { userId_categoryId: { userId: session.user.id, categoryId } },
      });
      const quizCount = await prisma.quizProgress.count({ where: { userId: session.user.id } });
      const isNewCategory = !existingRecord;
      const effectiveCount = quizCount + (isNewCategory ? 1 : 0);

      if (effectiveCount >= 10 && !earnedSlugs.includes("quizzes_10")) {
        badgesToAward.push("quizzes_10");
      }
      if (effectiveCount >= 50 && !earnedSlugs.includes("quizzes_50")) {
        badgesToAward.push("quizzes_50");
      }

      if (badgesToAward.length > 0) {
        for (const slug of badgesToAward) {
          const badge = allBadges.find(b => b.slug === slug);
          if (badge) {
            await prisma.userBadge.create({
              data: {
                userId: session.user.id,
                badgeId: badge.id
              }
            }).catch(() => {}); // Ignore duplicates
          }
        }
      }
    } catch (e) {
      console.error("Error awarding badges:", e);
    }
    // ----------------------
  }
  // ---------------------------

  // Upsert: update if exists, create if not. Keep best score.
  if (!isGranularSave && normalizedScore !== null) {
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
          score: Math.max(existing.score, normalizedScore),
          attempts: existing.attempts + 1,
        },
      });
    } else {
      await prisma.quizProgress.create({
        data: {
          userId: session.user.id,
          categoryId,
          score: normalizedScore,
          attempts: 1,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/quiz-progress — Reset progress for a category
export async function DELETE(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
  }

  try {
    // 1. Delete overall progress record
    await prisma.quizProgress.deleteMany({
      where: { userId: session.user.id, categoryId }
    });

    // 2. Delete all question responses for this category
    // First find questions in this category
    const categoryQuestions = await prisma.question.findMany({
      where: { categoryId },
      select: { id: true }
    });
    const questionIds = categoryQuestions.map(q => q.id);

    await prisma.questionResponse.deleteMany({
      where: {
        userId: session.user.id,
        questionId: { in: questionIds }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
