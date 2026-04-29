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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streak: true, lastActive: true, totalPoints: true, isSuspended: true }
  });

  if (!user || user.isSuspended) {
    return NextResponse.json({ error: "Unauthorized or Suspended" }, { status: 401 });
  }

  const now = new Date();
  const lastActive = user.lastActive ? new Date(user.lastActive) : null;
  
  // --- Sophisticated Security: Human Speed Check ---
  // If the user answers another question in less than 400ms, it's highly likely a bot/scraper.
  if (isGranularSave && lastActive) {
    const timeSinceLast = now.getTime() - lastActive.getTime();
    if (timeSinceLast < 400) {
      // Record suspicious activity in the user record
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          suspendedReason: `Suspicious speed detected: ${timeSinceLast}ms. Potencial bot/scraper.`
        }
      });
      return NextResponse.json({ error: "Comportamiento sospechoso detectado. Por favor, estudia a un ritmo humano." }, { status: 429 });
    }
  }

  let newStreak = user.streak;
  
  if (!lastActive) {
    newStreak = 1;
  } else {
    // Correctly handle timezones and day differences for streak
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d2 = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      streak: newStreak,
      lastActive: new Date(),
      totalPoints: { increment: pointsAwarded }
    }
  });

  // 140: Save only validated single-question attempts with upsert to prevent bloat.
  if (isGranularSave) {
    await prisma.questionResponse.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        }
      },
      update: {
        isCorrect: granularIsCorrect,
      },
      create: {
        userId: session.user.id,
        questionId,
        isCorrect: granularIsCorrect,
      },
    });
  }

  // Calculate or Update final module score
  if (!isGranularSave || granularIsCorrect) {
    // Fetch all correct answers for this user in this category to calculate REAL score
    const categoryQuestions = await prisma.question.findMany({
      where: { categoryId },
      select: { id: true }
    });
    const questionIds = categoryQuestions.map(q => q.id);
    const totalQuestions = questionIds.length;

    const correctResponsesCount = await prisma.questionResponse.count({
      where: {
        userId: session.user.id,
        questionId: { in: questionIds },
        isCorrect: true
      }
    });

    const calculatedScore = totalQuestions > 0 
      ? Math.round((correctResponsesCount / totalQuestions) * 100) 
      : 0;

    const existing = await prisma.quizProgress.findUnique({
      where: { userId_categoryId: { userId: session.user.id, categoryId } },
    });

    if (existing) {
      await prisma.quizProgress.update({
        where: { id: existing.id },
        data: {
          score: Math.max(existing.score, calculatedScore),
          attempts: isGranularSave ? existing.attempts : existing.attempts + 1,
        },
      });
    } else {
      await prisma.quizProgress.create({
        data: {
          userId: session.user.id,
          categoryId,
          score: calculatedScore,
          attempts: 1,
        },
      });
    }

    // --- Badge Awarding ---
    try {
      const allBadges = await prisma.badge.findMany();
      const existingUserBadges = await prisma.userBadge.findMany({
        where: { userId: session.user.id },
        select: { badge: { select: { slug: true } } }
      });
      const earnedSlugs = existingUserBadges.map(ub => ub.badge.slug);
      const badgesToAward = [];

      if (!earnedSlugs.includes("first_quiz")) badgesToAward.push("first_quiz");
      if (newStreak >= 3 && !earnedSlugs.includes("streak_3")) badgesToAward.push("streak_3");
      if (newStreak >= 7 && !earnedSlugs.includes("streak_7")) badgesToAward.push("streak_7");
      if (calculatedScore === 100 && !earnedSlugs.includes("score_100")) badgesToAward.push("score_100");
      
      const updatedTotalPoints = user.totalPoints + pointsAwarded;
      if (updatedTotalPoints >= 1000 && !earnedSlugs.includes("points_1000")) badgesToAward.push("points_1000");
      if (updatedTotalPoints >= 5000 && !earnedSlugs.includes("points_5000")) badgesToAward.push("points_5000");

      const quizCount = await prisma.quizProgress.count({ where: { userId: session.user.id } });
      if (quizCount >= 10 && !earnedSlugs.includes("quizzes_10")) badgesToAward.push("quizzes_10");
      if (quizCount >= 50 && !earnedSlugs.includes("quizzes_50")) badgesToAward.push("quizzes_50");

      // Career specific badges
      const careersToCheck = ["medicina", "ingenieria", "negocios"];
      for (const cSlug of careersToCheck) {
        if (!earnedSlugs.includes(`career_${cSlug}`)) {
          const countForCareer = await prisma.quizProgress.count({
            where: {
              userId: session.user.id,
              category: { career: { slug: cSlug } }
            }
          });
          if (countForCareer >= 5) {
            badgesToAward.push(`career_${cSlug}`);
          }
        }
      }

      const unlockedBadges = [];
      if (badgesToAward.length > 0) {
        for (const slug of badgesToAward) {
          const badge = allBadges.find(b => b.slug === slug);
          if (badge) {
            await prisma.userBadge.create({
              data: { userId: session.user.id, badgeId: badge.id }
            }).catch(() => {}); 
            unlockedBadges.push(badge);
          }
        }
      }

      return NextResponse.json({ success: true, unlockedBadges });
    } catch (e) {
      console.error("Error awarding badges:", e);
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
