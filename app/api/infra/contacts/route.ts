import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toBigIntSafe(v: unknown): bigint | null {
  try {
    if (typeof v === "bigint") return v;
    if (typeof v === "number" && Number.isFinite(v)) return BigInt(Math.trunc(v));
    if (typeof v === "string" && v.trim()) return BigInt(v.trim());
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idsRaw: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
    const onlyWithUsers = body?.onlyWithUsers !== false; // default true

    // 1) normalizar ids a BigInt
    const idsBig = idsRaw
      .map(toBigIntSafe)
      .filter((x): x is bigint => x !== null);

    if (idsBig.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // (opcional) limitar para evitar payload gigantes
    if (idsBig.length > 5000) {
      return NextResponse.json(
        { error: "Demasiados ids (max 5000 por request)" },
        { status: 400 }
      );
    }

    // 2) Traer relaciones por objectid IN (...)
    // Nota: consultamos la tabla puente porque es lo más directo.
    const rows = await prisma.infraestructuraUsuario.findMany({
      where: {
        objectid: { in: idsBig },
      },
      select: {
        objectid: true,
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            correo: true,
          },
        },
      },
    });

    // 3) Agrupar por objectid
    const map = new Map<string, any[]>();
    for (const r of rows) {
      const oid = r.objectid.toString();
      if (!map.has(oid)) map.set(oid, []);
      map.get(oid)!.push({
        id: r.usuario.id.toString(),
        nombres: r.usuario.nombres,
        apellidos: r.usuario.apellidos,
        correo: r.usuario.correo,
      });
    }

    // 4) construir respuesta en el mismo orden (si quieres)
    const data = Array.from(map.entries()).map(([objectid, usuarios]) => ({
      objectid,
      usuarios: onlyWithUsers ? usuarios : usuarios, // aquí podrías devolver [] si quieres incluir también vacíos
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}