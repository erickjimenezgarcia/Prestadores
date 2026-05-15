"use client";

import type { InfraLayer, MapPoint, RegionFilters } from "@/src/types/map";
import RegionFiltersPanel from "./RegionFilters";
import LayerSelector from "./LayerSelector";
import CentrosPobla from "./CentrosPobla";
import Usuarios from "./Usuarios";

type Props = {
  open: boolean;
  loading: boolean;
  loadingLayer: InfraLayer | null;
  totalPoints: number;
  filters: RegionFilters;
  layers: Record<InfraLayer, boolean>;

  selectedCentroIds: number[];

  onToggleOpen: () => void;
  onFiltersChange: (filters: RegionFilters) => void;
  onLayerClick: (layer: InfraLayer) => void;
  onSelectedCentrosChange: (points: MapPoint[], selectedIds: number[]) => void;
};

export default function MapSidebar({
  open,
  loading,
  loadingLayer,
  totalPoints,
  filters,
  layers,
  selectedCentroIds,
  onToggleOpen,
  onFiltersChange,
  onLayerClick,
  onSelectedCentrosChange,
}: Props) {
  return (
    <aside
      className={[
        "absolute left-0 top-0 z-[1000] h-full w-[390px] max-w-[90vw] bg-white shadow-2xl transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="absolute -right-10 top-24 flex h-12 w-10 items-center justify-center rounded-r-lg bg-blue-600 text-white shadow-lg cursor-pointer"
      >
        {open ? "‹" : "›"}
      </button>

      <div className="flex h-full flex-col">
        <div className="bg-blue-600 px-5 py-4 text-white">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
            {/* Logo izquierda */}
            <img
              src="/logos/logo2.png"
              alt="Logo izquierda"
              className="h-10 w-auto object-contain"
            />

            {/* Texto centro */}
            <div className="text-center">
              <h2 className="text-lg font-bold uppercase tracking-wide">
                Sistemas de Agua
              </h2>
              <p className="mt-1 text-xs text-red-100">
                Infraestructura de agua y saneamiento
              </p>
            </div>

            {/* Logo derecha */}
            <img
              src="/logos/logo1.png"
              alt="Logo derecha"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <RegionFiltersPanel filters={filters} onChange={onFiltersChange} />

          <div className="my-4 border-t border-slate-200" />

          <Usuarios idPrestador={filters.idPrestador} />

          <div className="my-4 border-t border-slate-200" />

          <CentrosPobla
            idPrestador={filters.idPrestador}
            selectedCentroIds={selectedCentroIds}
            onSelectedCentrosChange={onSelectedCentrosChange}
          />

          <div className="my-4 border-t border-slate-200" />

          <LayerSelector
            layers={layers}
            loadingLayer={loadingLayer}
            onLayerClick={onLayerClick}
          />
        </div>

        <div className="border-t bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {loading ? (
            <span>Cargando capa...</span>
          ) : (
            <span>{totalPoints} puntos visibles</span>
          )}
        </div>
      </div>
    </aside>
  );
}