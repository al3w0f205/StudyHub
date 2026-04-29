import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, text, options, correctIndex, hint, explanation } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    const updated = await prisma.question.update({
      where: { id },
      data: {
        text,
        options,
        correctIndex,
        hint,
        explanation
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
