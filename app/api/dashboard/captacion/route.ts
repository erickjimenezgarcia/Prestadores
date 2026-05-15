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

    const idCaptacion = toIntParam(searchParams.get("idCaptacion"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));
    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idSistemaAguaGlobal = toIntParam(
      searchParams.get("idSistemaAguaGlobal")
    );

    const captaciones = await prisma.captacion.findMany({
  where: {
    ...(idsCentroP.length > 0
      ? {
          idCentroP: {
            in: idsCentroP,
          },
        }
      : {}),

    ...(idsPrestador.length > 0
      ? {
          prestadorCaptacion: {
            some: {
              idPrestador: {
                in: idsPrestador,
              },
            },
          },
        }
      : {}),
  },
  include: {
    centroPoblado: true,
    sistemaAguaGlobal: true,
    prestadorCaptacion: {
      include: {
        prestador: true,
      },
    },
  },
});

    return NextResponse.json({
      ok: true,
      total: captaciones.length,
      filtros: {
        idCaptacion: idCaptacion ?? null,
        idCentroP: idsCentroP ?? null,
        idPrestador: idsPrestador ?? null,
        idSistemaAguaGlobal: idSistemaAguaGlobal ?? null,
      },
      data: captaciones.map((c) => ({
        id: c.id,
        tipoCaptacion: c.tipoCaptacion,
        lcomparte: c.lcomparte,
        lprotegida: c.lprotegida,
        antiguedad: c.antiguedad,
        estadoOperativo: c.estadoOperativo,
        estadoFisico: c.estadoFisico,
        ldesinfectan: c.ldesinfectan,
        lat: c.lat,
        lng: c.lng,

        centroPoblado: c.centroPoblado
          ? {
              id: c.centroPoblado.id,
              nombre: c.centroPoblado.nombre,
              ubigeo: c.centroPoblado.ubigeo,
            }
          : null,

        sistemaAguaGlobal: c.sistemaAguaGlobal
          ? {
              id: c.sistemaAguaGlobal.id,
              nombre: c.sistemaAguaGlobal.nombre,
            }
          : null,

        prestadores: c.prestadorCaptacion.map((pc) => ({
          id: pc.prestador.id,
          nombre: pc.prestador.nombPrestador,
          tipo: pc.prestador.tipoPrestador,
        })),
      })),
    });
  } catch (error) {
    console.error("Error consultando captaciones:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando captaciones",
      },
      { status: 500 }
    );
  }
}