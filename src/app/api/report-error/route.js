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
  const cleanReason = String(reason || "").trim();

  if (!questionId || !cleanReason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (cleanReason.length < 8) {
    return NextResponse.json(
      { error: "El reporte debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  try {
    const existingPending = await prisma.errorReport.findFirst({
      where: {
        questionId,
        userId: session.user.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "Ya tienes un reporte pendiente para esta pregunta." },
        { status: 409 }
      );
    }

    await prisma.errorReport.create({
      data: {
        questionId,
        userId: session.user.id,
        reason: cleanReason,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reporting issue:", error);
    return NextResponse.json({ error: "Failed to report issue" }, { status: 500 });
  }
}
