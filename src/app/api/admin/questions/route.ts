// =============================================================================
// StudyHub — API Admin: Edición de Preguntas (/api/admin/questions)
// =============================================================================
// Permite a los administradores editar preguntas existentes directamente
// desde la interfaz del quiz (editor in-situ AdminQuestionEditor).
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/questions
 * Actualiza los campos de una pregunta existente.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parseo seguro del body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, text, options, correctIndex, hint, explanation } = body;

  // El ID es obligatorio para identificar qué pregunta editar
  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    // Actualizar solo los campos proporcionados
    const updated = await prisma.question.update({
      where: { id },
      data: {
        text,
        options,
        correctIndex,
        hint,
        explanation,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
