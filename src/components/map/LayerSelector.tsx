"use client";

import type { InfraLayer } from "@/src/types/map";

type Props = {
  layers: Record<InfraLayer, boolean>;
  loadingLayer: InfraLayer | null;
  onLayerClick: (layer: InfraLayer) => void;
};

const OPTIONS: { key: InfraLayer; label: string; description: string }[] = [
  {
    key: "fuentes",
    label: "Fuentes",
    description: "Fuentes de agua",
  },
  {
    key: "captaciones",
    label: "Captaciones",
    description: "Puntos de captación",
  },
  {
    key: "ptaps",
    label: "PTAP",
    description: "Plantas de tratamiento de agua potable",
  },
  {
    key: "reservorios",
    label: "Reservorios",
    description: "Almacenamiento de agua",
  },
  {
    key: "ptars",
    label: "PTAR",
    description: "Plantas de tratamiento de aguas residuales",
  },
  {
    key: "disposicionesFinales",
    label: "Disposición final",
    description: "Vertimientos o disposición final",
  },
];

export default function LayerSelector({
  layers,
  loadingLayer,
  onLayerClick,
}: Props) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
        Infraestructura
      </h3>

      <div className="space-y-2">
        {OPTIONS.map((option) => {
          const active = layers[option.key];
          const loading = loadingLayer === option.key;

          return (
            <button
              key={option.key}
              type="button"
              disabled={loadingLayer !== null}
              onClick={() => onLayerClick(option.key)}
              className={[
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition",
                active
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
                loadingLayer !== null ? "cursor-wait opacity-80" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-1 h-4 w-4 rounded border",
                  active ? "border-red-600 bg-red-600" : "border-slate-400",
                ].join(" ")}
              />

              <span className="flex-1">
                <span className="block text-sm font-semibold text-slate-800">
                  {option.label}
                </span>
                <span className="block text-xs text-slate-500">
                  {loading ? "Cargando..." : option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}