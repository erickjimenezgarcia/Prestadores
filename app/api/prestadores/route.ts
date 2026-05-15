import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const departamento = searchParams.get("departamento");
    const provincia = searchParams.get("provincia");
    const distrito = searchParams.get("distrito");

    const rows = await prisma.poblacionServicio.findMany({
      where: {
        ...(departamento
          ? {
              departamento: {
                equals: departamento,
                mode: "insensitive",
              },
            }
          : {}),

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
        prestador: true,
        centroPoblado: true,
      },
      orderBy: [
        { departamento: "asc" },
        { provincia: "asc" },
        { distrito: "asc" },
      ],
    });

    const prestadoresMap = new Map<number, any>();
    const centrosMap = new Map<number, any>();

    for (const item of rows) {
      prestadoresMap.set(item.prestador.id, {
        id: item.prestador.id,
        nombre: item.prestador.nombPrestador,
        tipo: item.prestador.tipoPrestador,
        brindaAgua: item.prestador.brindaAgua,
        brindaAlcanta: item.prestador.brindaAlcanta,
        brindaSantExc: item.prestador.brindaSantExc,
        brindaTrataRes: item.prestador.brindaTrataRes,
      });

      centrosMap.set(item.centroPoblado.id, {
        id: item.centroPoblado.id,
        nombre: item.centroPoblado.nombre,
        ubigeo: item.centroPoblado.ubigeo,
        departamento: item.departamento,
        provincia: item.provincia,
        distrito: item.distrito,
        poblacion: item.poblacion,
        viviendas: item.viviendas,
        lat: item.lat,
        lng: item.lng,
      });
    }

    const prestadores = Array.from(prestadoresMap.values()).sort((a, b) =>
      String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""))
    );

    const centrosPoblados = Array.from(centrosMap.values()).sort((a, b) =>
      String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""))
    );

    return NextResponse.json({
      ok: true,
      totalRelaciones: rows.length,
      totalPrestadores: prestadores.length,
      totalCentrosPoblados: centrosPoblados.length,
      data: {
        prestadores,
        centrosPoblados,
      },
    });
  } catch (error) {
    console.error("Error filtrando prestadores y centros poblados:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error filtrando prestadores y centros poblados",
      },
      { status: 500 }
    );
  }
}