import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const [
      prestadores,
      centrosPoblados,
      sistemasAgua,
      captaciones,
      ptaps,
      reservorios,
      sistemasAlcantarillado,
      ptars,
      disposicionesFinales,
    ] = await Promise.all([
      prisma.prestador.count(),
      prisma.centroPoblado.count(),
      prisma.sistemaAgua.count(),
      prisma.captacion.count(),
      prisma.pTAP.count(),
      prisma.reservorio.count(),
      prisma.sistemaAlcantarillado.count(),
      prisma.pTAR.count(),
      prisma.disposicionFinal.count(),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        prestadores,
        centrosPoblados,
        sistemasAgua,
        captaciones,
        ptaps,
        reservorios,
        sistemasAlcantarillado,
        ptars,
        disposicionesFinales,
      },
    });
  } catch (error) {
    console.error("Error dashboard:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando dashboard",
      },
      { status: 500 }
    );
  }
}