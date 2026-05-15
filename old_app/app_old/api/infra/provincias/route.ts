import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const departamento = req.nextUrl.searchParams.get("departamento")?.trim();

    if (!departamento) {
      return NextResponse.json(
        { error: "Falta departamento" },
        { status: 400 }
      );
    }

    const rows = await prisma.infraestructura.findMany({
      where: {
        departamen: {
          equals: departamento,
          mode: "insensitive",
        },
        provincia: { not: null },
      },
      select: { provincia: true },
    });

    const items = Array.from(
      new Set(
        rows
          .map((r) => (r.provincia ?? "").trim())
          .filter((v) => v.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error obteniendo provincias", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}