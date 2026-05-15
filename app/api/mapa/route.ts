import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import type { InfraLayer, MapPoint } from "@/src/types/map";

function toIntParam(value: string | null): number | undefined {
  if (!value) return undefined;

  const n = Number(value);
  if (Number.isNaN(n)) return undefined;

  return Math.trunc(n);
}

const DEFAULT_LAYERS: InfraLayer[] = [
  "fuentes",
  "captaciones",
  "ptaps",
  "reservorios",
  "ptars",
  "disposicionesFinales",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const idPrestador = toIntParam(searchParams.get("idPrestador"));
    const idCentroP = toIntParam(searchParams.get("idCentroP"));

    const requestedLayers = searchParams.getAll("layers") as InfraLayer[];
    const layers = requestedLayers.length > 0 ? requestedLayers : DEFAULT_LAYERS;

    const points: MapPoint[] = [];

    if (layers.includes("fuentes")) {
      const fuentes = await prisma.fuente.findMany({
        where: {
          ...(idPrestador ? { idPrestador } : {}),
          ...(idCentroP ? { idCentroP } : {}),
        },
        include: {
          prestador: true,
          centroPoblado: true,
        },
      });

      points.push(
        ...fuentes
          .filter((f) => f.lat !== null && f.lng !== null)
          .map((f) => ({
            id: `fuente_${f.id}`,
            type: "fuente" as const,
            title: f.nombFuente,
            lat: f.lat!,
            lng: f.lng!,
            prestador: {
              id: f.prestador.id,
              nombre: f.prestador.nombPrestador,
            },
            centroPoblado: {
              id: f.centroPoblado.id,
              nombre: f.centroPoblado.nombre,
              ubigeo: f.centroPoblado.ubigeo,
            },
            raw: f,
          }))
      );
    }

    if (layers.includes("captaciones")) {
      const captaciones = await prisma.captacion.findMany({
        where: {
          ...(idCentroP ? { idCentroP } : {}),
          ...(idPrestador
            ? {
                prestadorCaptacion: {
                  some: {
                    idPrestador,
                  },
                },
              }
            : {}),
        },
        include: {
          centroPoblado: true,
          prestadorCaptacion: {
            include: {
              prestador: true,
            },
          },
        },
      });

      points.push(
        ...captaciones
          .filter((c) => c.lat !== null && c.lng !== null)
          .map((c) => ({
            id: `captacion_${c.id}`,
            type: "captacion" as const,
            title: c.tipoCaptacion,
            lat: c.lat!,
            lng: c.lng!,
            estadoOperativo: c.estadoOperativo,
            estadoFisico: c.estadoFisico,
            prestador: c.prestadorCaptacion[0]
              ? {
                  id: c.prestadorCaptacion[0].prestador.id,
                  nombre: c.prestadorCaptacion[0].prestador.nombPrestador,
                }
              : null,
            centroPoblado: {
              id: c.centroPoblado.id,
              nombre: c.centroPoblado.nombre,
              ubigeo: c.centroPoblado.ubigeo,
            },
            raw: c,
          }))
      );
    }

    if (layers.includes("ptaps")) {
      const ptaps = await prisma.pTAP.findMany({
        where: {
          ...(idPrestador || idCentroP
            ? {
                detalles: {
                  some: {
                    ...(idPrestador ? { idPrestador } : {}),
                    ...(idCentroP ? { idCentroP } : {}),
                  },
                },
              }
            : {}),
        },
        include: {
          detalles: {
            include: {
              prestador: true,
              centroPoblado: true,
            },
          },
        },
      });

      points.push(
        ...ptaps
          .filter((p) => p.lat !== null && p.lng !== null)
          .map((p) => {
            const detalle = p.detalles[0];

            return {
              id: `ptap_${p.idPtap}`,
              type: "ptap" as const,
              title: p.tipoPtap,
              lat: p.lat!,
              lng: p.lng!,
              estadoOperativo: p.estadoOperativo,
              estadoFisico: p.estadoFisico,
              prestador: detalle
                ? {
                    id: detalle.prestador.id,
                    nombre: detalle.prestador.nombPrestador,
                  }
                : null,
              centroPoblado: detalle
                ? {
                    id: detalle.centroPoblado.id,
                    nombre: detalle.centroPoblado.nombre,
                    ubigeo: detalle.centroPoblado.ubigeo,
                  }
                : null,
              raw: p,
            };
          })
      );
    }

    if (layers.includes("reservorios")) {
      const reservorios = await prisma.reservorio.findMany({
        where: {
          ...(idPrestador ? { idPrestador } : {}),
          ...(idCentroP ? { idCentroP } : {}),
        },
        include: {
          prestador: true,
          centroPoblado: true,
        },
      });

      points.push(
        ...reservorios
          .filter((r) => r.lat !== null && r.lng !== null)
          .map((r) => ({
            id: `reservorio_${r.id}`,
            type: "reservorio" as const,
            title: r.tipoReservorio,
            lat: r.lat!,
            lng: r.lng!,
            estadoOperativo: r.estadoOperativo,
            estadoFisico: r.estadoFisico,
            prestador: {
              id: r.prestador.id,
              nombre: r.prestador.nombPrestador,
            },
            centroPoblado: {
              id: r.centroPoblado.id,
              nombre: r.centroPoblado.nombre,
              ubigeo: r.centroPoblado.ubigeo,
            },
            raw: r,
          }))
      );
    }

    if (layers.includes("ptars")) {
      const ptars = await prisma.pTAR.findMany({
        where: {
          ...(idPrestador ? { idPrestador } : {}),
          ...(idCentroP ? { idCentroP } : {}),
        },
        include: {
          prestador: true,
          centroPoblado: true,
        },
      });

      points.push(
        ...ptars
          .filter((p) => p.lat !== null && p.lng !== null)
          .map((p) => ({
            id: `ptar_${p.id}`,
            type: "ptar" as const,
            title: p.tipoPtar,
            lat: p.lat!,
            lng: p.lng!,
            estadoOperativo: p.estadoOperativo,
            estadoFisico: p.estadoFisico,
            prestador: {
              id: p.prestador.id,
              nombre: p.prestador.nombPrestador,
            },
            centroPoblado: {
              id: p.centroPoblado.id,
              nombre: p.centroPoblado.nombre,
              ubigeo: p.centroPoblado.ubigeo,
            },
            raw: p,
          }))
      );
    }

    if (layers.includes("disposicionesFinales")) {
      const disposiciones = await prisma.disposicionFinal.findMany({
        where: {
          ...(idPrestador || idCentroP
            ? {
                detalles: {
                  some: {
                    ...(idPrestador ? { idPrestador } : {}),
                    ...(idCentroP ? { idCentroP } : {}),
                  },
                },
              }
            : {}),
        },
        include: {
          detalles: {
            include: {
              prestador: true,
              centroPoblado: true,
            },
          },
        },
      });

      points.push(
        ...disposiciones
          .filter((d) => d.lat !== null && d.lng !== null)
          .map((d) => {
            const detalle = d.detalles[0];

            return {
              id: `disposicion_final_${d.idVertimiento}`,
              type: "disposicion_final" as const,
              title: d.tipoDispo,
              lat: d.lat!,
              lng: d.lng!,
              prestador: detalle
                ? {
                    id: detalle.prestador.id,
                    nombre: detalle.prestador.nombPrestador,
                  }
                : null,
              centroPoblado: detalle
                ? {
                    id: detalle.centroPoblado.id,
                    nombre: detalle.centroPoblado.nombre,
                    ubigeo: detalle.centroPoblado.ubigeo,
                  }
                : null,
              raw: d,
            };
          })
      );
    }

    return NextResponse.json({
      ok: true,
      total: points.length,
      data: points,
    });
  } catch (error) {
    console.error("Error consultando puntos del mapa:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Error consultando puntos del mapa",
      },
      { status: 500 }
    );
  }
}