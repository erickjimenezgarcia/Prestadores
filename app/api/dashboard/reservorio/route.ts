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

    const idReservorio = toIntParam(searchParams.get("idReservorio"));
    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));
    const idSistemaAguaGlobal = toIntParam(
      searchParams.get("idSistemaAguaGlobal")
    );

    const reservorios = await prisma.reservorio.findMany({
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
    sistemaAguaGlobal: {
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
      total: reservorios.length,
      filtros: {
        idReservorio: idReservorio ?? null,
        idPrestador: idsPrestador ?? null,
        idCentroP: idsCentroP ?? null,
        idSistemaAguaGlobal: idSistemaAguaGlobal ?? null,
      },
      data: reservorios.map((r) => ({
        id: r.id,
        tipoReservorio: r.tipoReservorio,
        lat: r.lat,
        lng: r.lng,
        volumen: r.volumen,
        antiguedad: r.antiguedad,
        estadoOperativo: r.estadoOperativo,
        estadoFisico: r.estadoFisico,
        ldesinfectan: r.ldesinfectan,

        prestador: {
          id: r.prestador.id,
          nombre: r.prestador.nombPrestador,
          tipo: r.prestador.tipoPrestador,
        },

        centroPoblado: {
          id: r.centroPoblado.id,
          nombre: r.centroPoblado.nombre,
          ubigeo: r.centroPoblado.ubigeo,
        },

        sistemaAguaGlobal: r.sistemaAguaGlobal
          ? {
              id: r.sistemaAguaGlobal.id,
              nombre: r.sistemaAguaGlobal.nombre,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Error consultando reservorios:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando reservorios",
      },
      { status: 500 }
    );
  }
}