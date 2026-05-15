import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toIntList(values: string[]): number[] {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const idsPrestador = toIntList(searchParams.getAll("idPrestador"));
    const idsCentroP = toIntList(searchParams.getAll("idCentroP"));

    const fuentes = await prisma.fuente.findMany({
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
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      ok: true,
      total: fuentes.length,
      data: fuentes.map((f) => ({
        id: f.id,
        tipoFuenteAgua: f.tipoFuenteAgua,
        subTipoFuente: f.subTipoFuente,
        nombFuente: f.nombFuente,
        lat: f.lat,
        lng: f.lng,
        prestador: {
          id: f.prestador.id,
          nombre: f.prestador.nombPrestador,
          tipo: f.prestador.tipoPrestador,
        },
        centroPoblado: f.centroPoblado,
      })),
    });
  } catch (error) {
    console.error("Error consultando fuentes:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando fuentes",
      },
      { status: 500 }
    );
  }
}