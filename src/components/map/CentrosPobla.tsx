"use client";

import { useEffect, useState } from "react";
import type { MapPoint } from "@/src/types/map";

type CentroPobladoPrestador = {
  idRelacion: number;
  idCentroP: number;
  nombre: string | null;
  ubigeo: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  poblacion: number | null;
  viviendas: number | null;
  lat: number | null;
  lng: number | null;
  prestador: {
    id: number;
    nombre: string | null;
    tipo: string | null;
  };
};

type Props = {
  idPrestador?: number;
  selectedCentroIds: number[];
  onSelectedCentrosChange: (points: MapPoint[], selectedIds: number[]) => void;
};

export default function CentrosPobla({
  idPrestador,
  selectedCentroIds,
  onSelectedCentrosChange,
}: Props) {
  const [centros, setCentros] = useState<CentroPobladoPrestador[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCentros() {
      if (!idPrestador) {
        setCentros([]);
        onSelectedCentrosChange([], []);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/dashboard/centrosPrestador?idPrestador=${idPrestador}`
        );

        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.message ?? "Error cargando centros poblados");
        }

        setCentros(json.data ?? []);
        onSelectedCentrosChange([], []);
      } catch (error) {
        console.error("Error centros poblados:", error);
        setCentros([]);
        onSelectedCentrosChange([], []);
      } finally {
        setLoading(false);
      }
    }

    loadCentros();
  }, [idPrestador]);

  function toMapPoint(centro: CentroPobladoPrestador): MapPoint | null {
    if (centro.lat === null || centro.lng === null) return null;

    return {
      id: `centro_poblado_${centro.idCentroP}`,
      type: "centro_poblado",
      title: centro.nombre ?? "Centro poblado",
      lat: centro.lat,
      lng: centro.lng,
      prestador: {
        id: centro.prestador.id,
        nombre: centro.prestador.nombre,
      },
      centroPoblado: {
        id: centro.idCentroP,
        nombre: centro.nombre,
        ubigeo: centro.ubigeo,
      },
      raw: centro,
    };
  }

  function handleToggle(centro: CentroPobladoPrestador) {
    const alreadySelected = selectedCentroIds.includes(centro.idCentroP);

    const nextIds = alreadySelected
      ? selectedCentroIds.filter((id) => id !== centro.idCentroP)
      : [...selectedCentroIds, centro.idCentroP];

    const nextPoints = centros
      .filter((c) => nextIds.includes(c.idCentroP))
      .map(toMapPoint)
      .filter((p): p is MapPoint => p !== null);

    onSelectedCentrosChange(nextPoints, nextIds);
  }

  if (!idPrestador) {
    return (
      <section>
        <h3 className="map-section-title">Centros poblados</h3>
        <p className="text-sm text-slate-500">
          Selecciona un prestador para ver sus centros poblados.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h3 className="map-section-title">Centros poblados</h3>

      {loading && (
        <p className="text-sm text-slate-500">Cargando centros poblados...</p>
      )}

      {!loading && centros.length === 0 && (
        <p className="text-sm text-slate-500">
          No hay centros poblados para este prestador.
        </p>
      )}

      <div className="space-y-2">
        {centros.map((centro) => {
          const checked = selectedCentroIds.includes(centro.idCentroP);
          const hasLocation = centro.lat !== null && centro.lng !== null;

          return (
            <label
              key={centro.idCentroP}
              className={[
                "flex cursor-pointer gap-3 rounded-lg border p-3 text-sm",
                checked ? "border-red-500 bg-red-50" : "border-slate-200",
                !hasLocation ? "opacity-60" : "",
              ].join(" ")}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!hasLocation}
                onChange={() => handleToggle(centro)}
                className="mt-1"
              />

              <span>
                <span className="block font-semibold text-slate-800">
                  {centro.nombre ?? `Centro ${centro.idCentroP}`}
                </span>

                <span className="block text-xs text-slate-500">
                  {centro.departamento} / {centro.provincia} /{" "}
                  {centro.distrito}
                </span>

                {!hasLocation && (
                  <span className="block text-xs text-red-500">
                    Sin coordenadas
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}