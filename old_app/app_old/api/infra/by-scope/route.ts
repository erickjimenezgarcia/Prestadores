import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { jsonBigIntSafe } from "@/src/lib/json";

export async function GET(req: NextRequest) {
  try {
    const departamento = req.nextUrl.searchParams.get("departamento")?.trim();
    const provincia = req.nextUrl.searchParams.get("provincia")?.trim();
    const distrito = req.nextUrl.searchParams.get("distrito")?.trim();

    if (!departamento) {
      return NextResponse.json(
        { error: "Falta departamento" },
        { status: 400 }
      );
    }

    const items = await prisma.infraestructura.findMany({
      where: {
        departamen: {
          equals: departamento,
          mode: "insensitive",
        },
        ...(provincia
          ? {
              provincia: {
                equals: provincia,
                mode: "insensitive",
              },
            }
          : {}),
        ...(distrito
          ? {
              distrito: {
                equals: distrito,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        usuarios: true,
      },
      orderBy: [
        { provincia: "asc" },
        { distrito: "asc" },
        { nombre: "asc" },
      ],
      take: 500,
    });

    const data = items.map((i) => ({
      objectid: i.objectid,
      nombre: i.nombre,
      prestador: i.prestador,
      provincia: i.provincia,
      distrito: i.distrito,
      hasUser: i.usuarios.length > 0,
      usuariosCount: i.usuarios.length,
    }));

    return NextResponse.json(jsonBigIntSafe({ ok: true, items: data }));
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error obteniendo infraestructuras", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}