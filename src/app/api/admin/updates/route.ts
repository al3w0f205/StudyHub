// =============================================================================
// StudyHub — API Admin: Gestión de Actualizaciones (/api/admin/updates)
// =============================================================================
// CRUD para el changelog. Las actualizaciones se muestran en /updates.
// MÉTODOS: POST (crear) | DELETE (eliminar por ID)
// =============================================================================

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/admin/updates — Crear entrada de changelog. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, type, version } = await req.json();
    const update = await prisma.changelog.create({
      data: { title, content, type, version },
    });
    return NextResponse.json(update);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** DELETE /api/admin/updates?id=<id> — Eliminar entrada por ID. */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  try {
    await prisma.changelog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
