"use client";

import { useState } from "react";
import InfraMap from "./InfraMap";
import MapSidebar from "./MapSidebar";
import type { InfraLayer, MapPoint, RegionFilters } from "@/src/types/map";

const DEFAULT_LAYERS: Record<InfraLayer, boolean> = {
  fuentes: false,
  captaciones: false,
  ptaps: false,
  reservorios: false,
  ptars: false,
  disposicionesFinales: false,
};

function buildParams(filters: RegionFilters) {
  const params = new URLSearchParams();

  if (filters.idPrestador) {
    params.set("idPrestador", String(filters.idPrestador));
  }


  return params;
}






async function fetchJson(url: string) {
  const res = await fetch(url);

  const contentType = res.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    console.error("La API no devolvió JSON:", url, text.slice(0, 300));
    throw new Error(`La API no devolvió JSON: ${url}`);
  }

  const json = await res.json();

  if (!res.ok || json.ok === false) {
    throw new Error(json.message ?? `Error consultando ${url}`);
  }

  return json;
}

function normalizeFuentes(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => ({
      id: `fuente_${x.id}`,
      type: "fuente",
      title: x.nombFuente ?? x.tipoFuenteAgua ?? "Fuente",
      lat: x.lat,
      lng: x.lng,
      prestador: x.prestador
        ? {
            id: x.prestador.id,
            nombre: x.prestador.nombre ?? x.prestador.nombPrestador ?? null,
          }
        : null,
      centroPoblado: x.centroPoblado ?? null,
      raw: x,
    }));
}

function normalizeCaptaciones(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => ({
      id: `captacion_${x.id}`,
      type: "captacion",
      title: x.tipoCaptacion ?? "Captación",
      lat: x.lat,
      lng: x.lng,
      estadoOperativo: x.estadoOperativo,
      estadoFisico: x.estadoFisico,
      prestador: x.prestadores?.[0]
        ? {
            id: x.prestadores[0].id,
            nombre: x.prestadores[0].nombre,
          }
        : null,
      centroPoblado: x.centroPoblado ?? null,
      raw: x,
    }));
}

function normalizePtaps(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => {
      const detalle = x.detalles?.[0];

      return {
        id: `ptap_${x.idPtap}`,
        type: "ptap",
        title: x.tipoPtap ?? "PTAP",
        lat: x.lat,
        lng: x.lng,
        estadoOperativo: x.estadoOperativo,
        estadoFisico: x.estadoFisico,
        prestador: detalle?.prestador
          ? {
              id: detalle.prestador.id,
              nombre:
                detalle.prestador.nombre ??
                detalle.prestador.nombPrestador ??
                null,
            }
          : null,
        centroPoblado: detalle?.centroPoblado ?? null,
        raw: x,
      } satisfies MapPoint;
    });
}

function normalizeReservorios(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => ({
      id: `reservorio_${x.id}`,
      type: "reservorio",
      title: x.tipoReservorio ?? "Reservorio",
      lat: x.lat,
      lng: x.lng,
      estadoOperativo: x.estadoOperativo,
      estadoFisico: x.estadoFisico,
      prestador: x.prestador
        ? {
            id: x.prestador.id,
            nombre: x.prestador.nombre ?? x.prestador.nombPrestador ?? null,
          }
        : null,
      centroPoblado: x.centroPoblado ?? null,
      raw: x,
    }));
}

function normalizePtars(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => ({
      id: `ptar_${x.id}`,
      type: "ptar",
      title: x.tipoPtar ?? "PTAR",
      lat: x.lat,
      lng: x.lng,
      estadoOperativo: x.estadoOperativo,
      estadoFisico: x.estadoFisico,
      prestador: x.prestador
        ? {
            id: x.prestador.id,
            nombre: x.prestador.nombre ?? x.prestador.nombPrestador ?? null,
          }
        : null,
      centroPoblado: x.centroPoblado ?? null,
      raw: x,
    }));
}

function normalizeDisposiciones(items: any[]): MapPoint[] {
  return items
    .filter((x) => x.lat !== null && x.lng !== null)
    .map((x) => {
      const detalle = x.detalles?.[0];

      return {
        id: `disposicion_final_${x.idVertimiento}`,
        type: "disposicion_final",
        title: x.tipoDispo ?? "Disposición final",
        lat: x.lat,
        lng: x.lng,
        prestador: detalle?.prestador
          ? {
              id: detalle.prestador.id,
              nombre:
                detalle.prestador.nombre ??
                detalle.prestador.nombPrestador ??
                null,
            }
          : null,
        centroPoblado: detalle?.centroPoblado ?? null,
        raw: x,
      } satisfies MapPoint;
    });
}

async function fetchLayerByParams(
  layer: InfraLayer,
  params: URLSearchParams
): Promise<MapPoint[]> {
  const query = params.toString();

  if (layer === "fuentes") {
    const json = await fetchJson(`/api/dashboard/fuentes?${query}`);
    return normalizeFuentes(json.data ?? []);
  }

  if (layer === "captaciones") {
    const json = await fetchJson(`/api/dashboard/captacion?${query}`);
    return normalizeCaptaciones(json.data ?? []);
  }

  if (layer === "ptaps") {
    const json = await fetchJson(`/api/dashboard/ptap?${query}`);
    return normalizePtaps(json.data ?? []);
  }

  if (layer === "reservorios") {
    const json = await fetchJson(`/api/dashboard/reservorio?${query}`);
    return normalizeReservorios(json.data ?? []);
  }

  if (layer === "ptars") {
    const json = await fetchJson(`/api/dashboard/ptar?${query}`);
    return normalizePtars(json.data ?? []);
  }

  if (layer === "disposicionesFinales") {
    const json = await fetchJson(
      `/api/dashboard/disposicionFinal?${query}`
    );
    return normalizeDisposiciones(json.data ?? []);
  }

  return [];
}

async function fetchLayer(
  layer: InfraLayer,
  filters: RegionFilters,
  selectedCentroIds: number[]
): Promise<MapPoint[]> {
  const params = new URLSearchParams();

  /**
   * Siempre mandamos el prestador si existe.
   */
  if (filters.idPrestador) {
    params.set("idPrestador", String(filters.idPrestador));
  }

  /**
   * Si hay centros seleccionados, los mandamos también.
   * Esto genera:
   * ?idPrestador=25&idCentroP=31&idCentroP=32
   */
  selectedCentroIds.forEach((idCentroP) => {
    params.append("idCentroP", String(idCentroP));
  });

  return fetchLayerByParams(layer, params);
}

export default function MapShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<RegionFilters>({});
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [pointsByLayer, setPointsByLayer] = useState<
    Partial<Record<InfraLayer, MapPoint[]>>
  >({});
  const [loadingLayer, setLoadingLayer] = useState<InfraLayer | null>(null);
  const [centroPoints, setCentroPoints] = useState<MapPoint[]>([]);
  const [selectedCentroIds, setSelectedCentroIds] = useState<number[]>([]);

  const infraPoints = Object.entries(pointsByLayer)
    .filter(([layer]) => layers[layer as InfraLayer])
    .flatMap(([, layerPoints]) => layerPoints ?? []);

  const points = [...centroPoints, ...infraPoints];

  async function reloadActiveLayers(
  nextFilters: RegionFilters,
  nextSelectedCentroIds: number[]
) {
  const activeLayers = Object.entries(layers)
    .filter(([, active]) => active)
    .map(([layer]) => layer as InfraLayer);

  const hasPrestador = Boolean(nextFilters.idPrestador);
  const hasCentros = nextSelectedCentroIds.length > 0;

  if (!hasPrestador && !hasCentros) {
    setPointsByLayer({});
    return;
  }

  const nextPointsByLayer: Partial<Record<InfraLayer, MapPoint[]>> = {};

  for (const layer of activeLayers) {
    const layerPoints = await fetchLayer(
      layer,
      nextFilters,
      nextSelectedCentroIds
    );

    nextPointsByLayer[layer] = layerPoints;
  }

  setPointsByLayer(nextPointsByLayer);
}

  async function handleSelectedCentrosChange(
  points: MapPoint[],
  selectedIds: number[]
) {
  setCentroPoints(points);
  setSelectedCentroIds(selectedIds);

  /**
   * Cuando seleccionas/deseleccionas centros poblados,
   * se recargan las capas activas con UNA sola llamada por capa.
   *
   * Ejemplo:
   * /api/dashboard/captaciones?idCentroP=31&idCentroP=32
   */
  await reloadActiveLayers(filters, selectedIds);
}

  function handleFiltersChange(nextFilters: RegionFilters) {
    setFilters(nextFilters);

    setLayers(DEFAULT_LAYERS);
    setPointsByLayer({});

    setCentroPoints([]);
    setSelectedCentroIds([]);
  }

async function handleLayerClick(layer: InfraLayer) {
  const isActive = layers[layer];

  /**
   * Si la capa está activa, solo se oculta.
   * No llama API.
   */
  if (isActive) {
    setLayers((prev) => ({
      ...prev,
      [layer]: false,
    }));

    return;
  }

  const hasPrestador = Boolean(filters.idPrestador);
  const hasCentros = selectedCentroIds.length > 0;

  if (!hasPrestador && !hasCentros) {
    alert("Primero selecciona un prestador o centro poblado.");
    return;
  }

  try {
    setLoadingLayer(layer);

    const layerPoints = await fetchLayer(layer, filters, selectedCentroIds);

    setPointsByLayer((prev) => ({
      ...prev,
      [layer]: layerPoints,
    }));

    setLayers((prev) => ({
      ...prev,
      [layer]: true,
    }));
  } catch (error) {
    console.error(`Error cargando capa ${layer}:`, error);
  } finally {
    setLoadingLayer(null);
  }
}

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <InfraMap points={points} />

      <MapSidebar
  open={sidebarOpen}
  loading={loadingLayer !== null}
  loadingLayer={loadingLayer}
  filters={filters}
  layers={layers}
  totalPoints={points.length}
  selectedCentroIds={selectedCentroIds}
  onToggleOpen={() => setSidebarOpen((value) => !value)}
  onFiltersChange={handleFiltersChange}
  onLayerClick={handleLayerClick}
  onSelectedCentrosChange={handleSelectedCentrosChange}
/>
    </div>
  );
}