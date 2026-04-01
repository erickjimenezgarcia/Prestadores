import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

// GET /api/infra/by-dep?dep=LIMA
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dep = (searchParams.get("dep") || "").trim();

    if (!dep) {
      return NextResponse.json({ error: "Falta dep" }, { status: 400 });
    }

    // Traemos solo lo necesario + relación (solo para saber si existe usuario)
    const rows = await prisma.infraestructura.findMany({
      where: { departamen: dep },
      select: {
        objectid: true,
        x: true,
        y: true,
        prestador: true,
        // solo necesitamos saber si existe al menos 1
        usuarios: { select: { id: true }, take: 1 },
      },
      take: 20000, // por si un dep tiene bastante; ajusta si quieres
    });

    const data = rows
      .filter((r) => r.x !== null && r.y !== null) // sin coords no pintamos
      .map((r) => ({
        objectid: r.objectid, // BigInt -> lo convertimos en jsonBigIntSafe
        x: r.x,
        y: r.y,
        hasUser: r.usuarios.length > 0,
        prestador: r.prestador ?? null,
      }));

    return NextResponse.json(jsonBigIntSafe({ dep, count: data.length, data }));
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error listando por departamento", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}