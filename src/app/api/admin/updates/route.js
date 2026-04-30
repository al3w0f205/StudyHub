// =============================================================================
// StudyHub — API Admin: Gestión de Actualizaciones (/api/admin/updates)
// =============================================================================
// CRUD para el changelog. Las actualizaciones se muestran en /updates.
// MÉTODOS: POST (crear) | DELETE (eliminar por ID)
// NOTA: GET público en /api/updates (sin auth requerido).
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** POST /api/admin/updates — Crear entrada de changelog. */
export async function POST(req) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, type, version } = await req.json();
    const update = await prisma.changelog.create({
      data: { title, content, type, version }
    });
    return NextResponse.json(update);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/admin/updates?id=<id> — Eliminar entrada por ID. */
export async function DELETE(req) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    await prisma.changelog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
