import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  const { questionId, reason } = body;
  if (!questionId || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    await prisma.errorReport.create({
      data: {
        questionId,
        userId: session.user.id,
        reason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting issue:", error);
    return NextResponse.json({ error: "Failed to report issue" }, { status: 500 });
  }
}
