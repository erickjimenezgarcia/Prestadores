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

    const idPtap = toIntParam(searchParams.get("idPtap"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));
    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idSistemaAguaGlobal = toIntParam(
      searchParams.get("idSistemaAguaGlobal")
    );

    const ptaps = await prisma.pTAP.findMany({
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
        sistemaAguaGlobal: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    },
  },
  orderBy: {
    idPtap: "asc",
  },
});

    return NextResponse.json({
      ok: true,
      total: ptaps.length,
      filtros: {
        idPtap: idPtap ?? null,
        idPrestador: idsPrestador ?? null,
        idCentroP: idsCentroP ?? null,
        idSistemaAguaGlobal: idSistemaAguaGlobal ?? null,
      },
      data: ptaps.map((p) => ({
        idPtap: p.idPtap,
        tipoPtap: p.tipoPtap,
        lat: p.lat,
        lng: p.lng,
        antiguedad: p.antiguedad,
        estadoOperativo: p.estadoOperativo,
        estadoFisico: p.estadoFisico,
        ldesinfectan: p.ldesinfectan,

        detalles: p.detalles.map((d) => ({
          id: d.id,
          idPrestador: d.idPrestador,
          idCentroP: d.idCentroP,
          idSistemaAguaGlobal: d.idSistemaAguaGlobal,

          prestador: {
            id: d.prestador.id,
            nombre: d.prestador.nombPrestador,
            tipo: d.prestador.tipoPrestador,
          },

          centroPoblado: {
            id: d.centroPoblado.id,
            nombre: d.centroPoblado.nombre,
            ubigeo: d.centroPoblado.ubigeo,
          },

          sistemaAguaGlobal: d.sistemaAguaGlobal
            ? {
                id: d.sistemaAguaGlobal.id,
                nombre: d.sistemaAguaGlobal.nombre,
              }
            : null,
        })),
      })),
    });
  } catch (error) {
    console.error("Error consultando PTAP:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando PTAP",
      },
      { status: 500 }
    );
  }
}