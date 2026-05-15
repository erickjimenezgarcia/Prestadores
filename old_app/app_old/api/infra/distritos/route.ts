import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const departamento = req.nextUrl.searchParams.get("departamento")?.trim();
    const provincia = req.nextUrl.searchParams.get("provincia")?.trim();

    if (!departamento || !provincia) {
      return NextResponse.json(
        { error: "Falta departamento o provincia" },
        { status: 400 }
      );
    }

    const rows = await prisma.infraestructura.findMany({
      where: {
        departamen: {
          equals: departamento,
          mode: "insensitive",
        },
        provincia: {
          equals: provincia,
          mode: "insensitive",
        },
        distrito: { not: null },
      },
      select: { distrito: true },
    });

    const items = Array.from(
      new Set(
        rows
          .map((r) => (r.distrito ?? "").trim())
          .filter((v) => v.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error obteniendo distritos", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}