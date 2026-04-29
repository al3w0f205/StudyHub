import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all user responses with category info
    const responses = await prisma.questionResponse.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          include: {
            category: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    // Aggregate data by category
    const stats = {};
    responses.forEach(r => {
      const cat = r.question.category;
      if (!stats[cat.id]) {
        stats[cat.id] = { name: cat.name, correct: 0, total: 0 };
      }
      stats[cat.id].total += 1;
      if (r.isCorrect) stats[cat.id].correct += 1;
    });

    // Format for Radar: [{ name, value }] (value 0-100)
    const chartData = Object.values(stats).map(s => ({
      name: s.name,
      value: Math.round((s.correct / s.total) * 100)
    }));

    // Limit to top 6 categories for a clean radar
    const limitedData = chartData.sort((a, b) => b.value - a.value).slice(0, 6);

    return NextResponse.json({ data: limitedData });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
