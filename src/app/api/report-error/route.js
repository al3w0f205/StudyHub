// =============================================================================
// StudyHub — API: Reportar Error en Pregunta (/api/report-error)
// =============================================================================
// Permite a los estudiantes reportar errores en las preguntas (erratas,
// respuestas incorrectas, explicaciones confusas, etc.).
//
// PROTECCIONES:
//   - Requiere autenticación.
//   - Mínimo 8 caracteres en la descripción del error.
//   - Un solo reporte PENDIENTE por usuario por pregunta (evita spam).
//
// FLUJO:
//   1. Validar autenticación y campos requeridos.
//   2. Verificar que no exista un reporte PENDING del mismo usuario para la misma pregunta.
//   3. Crear el registro de ErrorReport con status "PENDING".
//   4. El admin puede ver estos reportes en /admin/error-reports.
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/report-error
 * Crea un reporte de error para una pregunta.
 * @body {{ questionId: string, reason: string }}
 */
export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parseo seguro del body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { questionId, reason } = body;
  const cleanReason = String(reason || "").trim();

  // Validar campos requeridos
  if (!questionId || !cleanReason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validar longitud mínima del reporte
  if (cleanReason.length < 8) {
    return NextResponse.json(
      { error: "El reporte debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  try {
    // Anti-spam: verificar que no exista un reporte PENDING del mismo usuario
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
        { status: 409 } // 409 Conflict
      );
    }

    // Crear el reporte con status PENDING
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
