import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type UbigeoRow = {
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
};

type Distrito = string;

type ProvinciaAgrupada = {
  provincia: string;
  distritos: Distrito[];
};

type DepartamentoAgrupado = {
  departamento: string;
  provincias: ProvinciaAgrupada[];
};

export async function GET() {
  try {
    const rows: UbigeoRow[] = await prisma.poblacionServicio.findMany({
      select: {
        departamento: true,
        provincia: true,
        distrito: true,
      },
      where: {
        departamento: {
          not: null,
        },
        provincia: {
          not: null,
        },
        distrito: {
          not: null,
        },
      },
      distinct: ["departamento", "provincia", "distrito"],
      orderBy: [
        {
          departamento: "asc",
        },
        {
          provincia: "asc",
        },
        {
          distrito: "asc",
        },
      ],
    });

    const map = new Map<string, Map<string, Set<string>>>();

    for (const row of rows) {
      const departamento = row.departamento?.trim();
      const provincia = row.provincia?.trim();
      const distrito = row.distrito?.trim();

      if (!departamento || !provincia || !distrito) continue;

      if (!map.has(departamento)) {
        map.set(departamento, new Map());
      }

      const provinciasMap = map.get(departamento)!;

      if (!provinciasMap.has(provincia)) {
        provinciasMap.set(provincia, new Set());
      }

      provinciasMap.get(provincia)!.add(distrito);
    }

    const data: DepartamentoAgrupado[] = Array.from(map.entries()).map(
      ([departamento, provinciasMap]) => ({
        departamento,
        provincias: Array.from(provinciasMap.entries()).map(
          ([provincia, distritosSet]) => ({
            provincia,
            distritos: Array.from(distritosSet).sort(),
          })
        ),
      })
    );

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Error consultando ubigeos:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando departamentos, provincias y distritos",
      },
      { status: 500 }
    );
  }
}