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

    // Award points (example: score percentage * 10)
    const pointsAwarded = Math.floor(score / 10);
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streak: newStreak,
        lastActive: new Date(),
        totalPoints: user.totalPoints + pointsAwarded
      }
    });
    // --- Save Individual Question Responses ---
    if (body.results && Array.isArray(body.results)) {
      try {
        await prisma.questionResponse.createMany({
          data: body.results.map(r => ({
            userId: session.user.id,
            questionId: r.questionId,
            isCorrect: r.isCorrect
          }))
        });
      } catch (e) {
        console.error("Error saving individual responses:", e);
      }
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
      
      // 1. First Quiz
      if (!earnedSlugs.includes("first_quiz")) {
        badgesToAward.push("first_quiz");
      }

      // 2. Streak 3
      if (newStreak >= 3 && !earnedSlugs.includes("streak_3")) {
        badgesToAward.push("streak_3");
      }

      // 3. Perfect Score
      if (score === 100 && !earnedSlugs.includes("score_100")) {
        badgesToAward.push("score_100");
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
            }).catch(() => {}); // Ignore duplicates if race condition
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
