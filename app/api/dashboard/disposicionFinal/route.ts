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

    const idVertimiento = toIntParam(searchParams.get("idVertimiento"));
    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));
    const idSistemaAlcantarillaGlobal = toIntParam(
      searchParams.get("idSistemaAlcantarillaGlobal")
    );

    const disposiciones = await prisma.disposicionFinal.findMany({
  where: {
    ...(idsPrestador.length > 0 || idsCentroP.length > 0
      ? {
          detalles: {
            some: {
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
          },
        }
      : {}),
  },
  include: {
    detalles: {
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
    },
  },
  orderBy: {
    idVertimiento: "asc",
  },
});

    return NextResponse.json({
      ok: true,
      total: disposiciones.length,
      filtros: {
        idVertimiento: idVertimiento ?? null,
        idPrestador: idsPrestador ?? null,
        idCentroP: idsCentroP ?? null,
        idSistemaAlcantarillaGlobal:
          idSistemaAlcantarillaGlobal ?? null,
      },
      data: disposiciones.map((d) => ({
        idVertimiento: d.idVertimiento,
        tipoDispo: d.tipoDispo,
        lat: d.lat,
        lng: d.lng,
        nombFuenteVert: d.nombFuenteVert,
        lAutorizacion: d.lAutorizacion,

        detalles: d.detalles.map((detalle) => ({
          id: detalle.id,
          idPrestador: detalle.idPrestador,
          idCentroP: detalle.idCentroP,
          idSistemaAlcantarillaGlobal:
            detalle.idSistemaAlcantarillaGlobal,

          prestador: {
            id: detalle.prestador.id,
            nombre: detalle.prestador.nombPrestador,
            tipo: detalle.prestador.tipoPrestador,
          },

          centroPoblado: {
            id: detalle.centroPoblado.id,
            nombre: detalle.centroPoblado.nombre,
            ubigeo: detalle.centroPoblado.ubigeo,
          },

          sistemaAlcantaGlobal: detalle.sistemaAlcantaGlobal
            ? {
                id: detalle.sistemaAlcantaGlobal.id,
                nombre: detalle.sistemaAlcantaGlobal.nombre,
              }
            : null,
        })),
      })),
    });
  } catch (error) {
    console.error("Error consultando disposición final:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando disposición final",
      },
      { status: 500 }
    );
  }
}