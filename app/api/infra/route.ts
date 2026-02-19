import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function jsonBigIntSafe(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const dep = searchParams.get("dep")?.trim() || "";
    const prov = searchParams.get("prov")?.trim() || "";
    const dist = searchParams.get("dist")?.trim() || "";
    const q = searchParams.get("q")?.trim() || "";

    const limitRaw = Number(searchParams.get("limit") ?? 500);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 5000) : 500;

    const cursorRaw = Number(searchParams.get("cursor") ?? 0);
    const cursor = Number.isFinite(cursorRaw) ? Math.max(cursorRaw, 0) : 0;

    const where: any = {};
    if (dep) where.departamen = dep;
    if (prov) where.provincia = prov;
    if (dist) where.distrito = dist;

    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { prestador: { contains: q, mode: "insensitive" } },
        { epsCorrec: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, rows] = await Promise.all([
      prisma.infraestructura.count({ where }),
      prisma.infraestructura.findMany({
        where,
        orderBy: { objectid: "asc" },
        skip: cursor,
        take: limit,
        select: {
          objectid: true,
          nombre: true,
          prestador: true,
          epsCorrec: true,
          tipoCap: true,
          tipodefuen: true,
          x: true,
          y: true,
          tipoPrest: true,
          tipoInfra: true,
          departamen: true,
          provincia: true,
          distrito: true,
        },
      }),
    ]);

    const payload = {
      meta: {
        total,
        limit,
        cursor,
        nextCursor: cursor + rows.length,
        hasMore: cursor + rows.length < total,
      },
      data: rows,
    };

    return NextResponse.json(jsonBigIntSafe(payload));
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error listando infraestructura", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}