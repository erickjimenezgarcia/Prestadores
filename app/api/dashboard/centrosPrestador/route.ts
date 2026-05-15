import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toIntParam(value: string | null): number | undefined {
  if (!value) return undefined;

  const n = Number(value);
  if (Number.isNaN(n)) return undefined;

  return Math.trunc(n);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const idPrestador = toIntParam(searchParams.get("idPrestador"));

    if (!idPrestador) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debe enviar idPrestador",
        },
        { status: 400 }
      );
    }

    const rows = await prisma.poblacionServicio.findMany({
      where: {
        idPrestador,
      },
      include: {
        centroPoblado: true,
        prestador: {
          select: {
            id: true,
            nombPrestador: true,
            tipoPrestador: true,
          },
        },
      },
      orderBy: [
        { departamento: "asc" },
        { provincia: "asc" },
        { distrito: "asc" },
      ],
    });

    const centrosMap = new Map<number, any>();

    for (const row of rows) {
      centrosMap.set(row.centroPoblado.id, {
        idRelacion: row.id,
        idCentroP: row.centroPoblado.id,
        nombre: row.centroPoblado.nombre,
        ubigeo: row.centroPoblado.ubigeo,

        departamento: row.departamento,
        provincia: row.provincia,
        distrito: row.distrito,

        poblacion: row.poblacion,
        viviendas: row.viviendas,

        lat: row.lat,
        lng: row.lng,

        prestador: {
          id: row.prestador.id,
          nombre: row.prestador.nombPrestador,
          tipo: row.prestador.tipoPrestador,
        },
      });
    }

    const centrosPoblados = Array.from(centrosMap.values());

    return NextResponse.json({
      ok: true,
      total: centrosPoblados.length,
      data: centrosPoblados,
    });
  } catch (error) {
    console.error("Error consultando centros por prestador:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando centros poblados por prestador",
      },
      { status: 500 }
    );
  }
}