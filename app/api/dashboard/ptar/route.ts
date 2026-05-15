import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toIntParam(value: string | null): number | undefined {
  if (!value) return undefined;

  const n = Number(value);

  if (Number.isNaN(n)) return undefined;

  return Math.trunc(n);
}

function toIntList(values: string[]): number[] {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const idPtar = toIntParam(searchParams.get("idPtar"));
    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));
    const idSistemaAlcantarillaGlobal = toIntParam(
      searchParams.get("idSistemaAlcantarillaGlobal")
    );

    const ptars = await prisma.pTAR.findMany({
  where: {
    ...(idsPrestador.length > 0
      ? {
          idPrestador: {
            in: idsPrestador,
          },
        }
      : {}),

    ...(idsCentroP.length > 0
      ? {
          idCentroP: {
            in: idsCentroP,
          },
        }
      : {}),
  },
  include: {
    prestador: {
      select: {
        id: true,
        nombPrestador: true,
        tipoPrestador: true,
      },
    },
    centroPoblado: {
      select: {
        id: true,
        nombre: true,
        ubigeo: true,
      },
    },
    sistemaAlcantaGlobal: {
      select: {
        id: true,
        nombre: true,
      },
    },
  },
  orderBy: {
    id: "asc",
  },
});

    return NextResponse.json({
      ok: true,
      total: ptars.length,
      filtros: {
        idPtar: idPtar ?? null,
        idPrestador: idsPrestador ?? null,
        idCentroP: idsCentroP ?? null,
        idSistemaAlcantarillaGlobal:
          idSistemaAlcantarillaGlobal ?? null,
      },
      data: ptars.map((p) => ({
        id: p.id,
        tipoPtar: p.tipoPtar,
        lat: p.lat,
        lng: p.lng,
        antiguedad: p.antiguedad,
        estadoOperativo: p.estadoOperativo,
        estadoFisico: p.estadoFisico,

        prestador: {
          id: p.prestador.id,
          nombre: p.prestador.nombPrestador,
          tipo: p.prestador.tipoPrestador,
        },

        centroPoblado: {
          id: p.centroPoblado.id,
          nombre: p.centroPoblado.nombre,
          ubigeo: p.centroPoblado.ubigeo,
        },

        sistemaAlcantaGlobal: p.sistemaAlcantaGlobal
          ? {
              id: p.sistemaAlcantaGlobal.id,
              nombre: p.sistemaAlcantaGlobal.nombre,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error consultando PTAR:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando PTAR",
      },
      { status: 500 }
    );
  }
}