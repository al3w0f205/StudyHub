// =============================================================================
// StudyHub — API: Changelog Público (/api/updates)
// =============================================================================
// Retorna las últimas 20 entradas del changelog para mostrar en /updates.
// No requiere autenticación (es contenido público informativo).
// Forzado a dinámico para siempre mostrar las últimas actualizaciones.
// =============================================================================

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Forzar renderizado dinámico (no cachear esta ruta)
export const dynamic = "force-dynamic";

/** GET /api/updates — Lista pública de actualizaciones recientes. */
export async function GET() {
  try {
    const updates = await prisma.changelog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });
    return NextResponse.json(updates);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
