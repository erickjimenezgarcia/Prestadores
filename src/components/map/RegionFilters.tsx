"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegionFilters } from "@/src/types/map";
import Select from "react-select";


type UbigeoResponse = {
  ok: boolean;
  data: {
    departamento: string;
    provincias: {
      provincia: string;
      distritos: string[];
    }[];
  }[];
};

type PrestadorItem = {
  id: number;
  nombre: string | null;
  tipo: string | null;
};

type Props = {
  filters: RegionFilters;
  onChange: (filters: RegionFilters) => void;
};

export default function RegionFiltersPanel({ filters, onChange }: Props) {
  const [ubigeos, setUbigeos] = useState<UbigeoResponse["data"]>([]);
  const [prestadores, setPrestadores] = useState<PrestadorItem[]>([]);

  useEffect(() => {
    async function loadUbigeos() {
      const res = await fetch("/api/dashboard/regiones");
      const json: UbigeoResponse = await res.json();

      if (json.ok) {
        setUbigeos(json.data);
      }
    }

    loadUbigeos();
  }, []);

  useEffect(() => {
    async function loadPrestadores() {
      const params = new URLSearchParams();

      if (filters.departamento) params.set("departamento", filters.departamento);
      if (filters.provincia) params.set("provincia", filters.provincia);
      if (filters.distrito) params.set("distrito", filters.distrito);

      const res = await fetch(
        `/api/prestadores?${params.toString()}`
      );

      const json = await res.json();

      if (json.ok) {
        console.log(json)
        setPrestadores(json.data?.prestadores  ?? []);
      }
    }

    loadPrestadores();
  }, [filters.departamento, filters.provincia, filters.distrito]);

  const provincias = useMemo(() => {
    const dep = ubigeos.find(
      (x) => x.departamento === filters.departamento
    );

    return dep?.provincias ?? [];
  }, [ubigeos, filters.departamento]);

  const distritos = useMemo(() => {
    const prov = provincias.find(
      (x) => x.provincia === filters.provincia
    );

    return prov?.distritos ?? [];
  }, [provincias, filters.provincia]);

  const prestadorOptions = [
  { value: "", label: "Todos los prestadores" },
  ...prestadores.map((p) => ({
    value: String(p.id),
    label: p.nombre ?? `Prestador ${p.id}`,
  })),
];

  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase text-slate-700">
        Filtros de ubicación
      </h3>

      <div className="space-y-3">
        <select
          value={filters.departamento ?? ""}
          onChange={(e) =>
            onChange({
              departamento: e.target.value || undefined,
              provincia: undefined,
              distrito: undefined,
              idPrestador: undefined,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los departamentos</option>
          {ubigeos.map((d) => (
            <option key={d.departamento} value={d.departamento}>
              {d.departamento}
            </option>
          ))}
        </select>

        <select
          value={filters.provincia ?? ""}
          disabled={!filters.departamento}
          onChange={(e) =>
            onChange({
              ...filters,
              provincia: e.target.value || undefined,
              distrito: undefined,
              idPrestador: undefined,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
        >
          <option value="">Todas las provincias</option>
          {provincias.map((p) => (
            <option key={p.provincia} value={p.provincia}>
              {p.provincia}
            </option>
          ))}
        </select>

        <select
          value={filters.distrito ?? ""}
          disabled={!filters.provincia}
          onChange={(e) =>
            onChange({
              ...filters,
              distrito: e.target.value || undefined,
              idPrestador: undefined,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
        >
          <option value="">Todos los distritos</option>
          {distritos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <Select
          value={
            prestadorOptions.find(
              (option) => option.value === String(filters.idPrestador ?? "")
            ) ?? prestadorOptions[0]
          }
          onChange={(option) =>
            onChange({
              ...filters,
              idPrestador:
                option?.value && option.value !== ""
                  ? Number(option.value)
                  : undefined,
            })
          }
          options={prestadorOptions}
          placeholder="Todos los prestadores"
          isSearchable
          className="text-sm"
          classNamePrefix="prestador-select"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "38px",
              borderRadius: "0.5rem",
              borderColor: "#cbd5e1",
              fontSize: "0.875rem",
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "2px 8px",
            }),
            option: (base) => ({
              ...base,
              padding: "6px 10px",
              fontSize: "0.875rem",
              lineHeight: "1.1rem",
            }),
            menu: (base) => ({
              ...base,
              zIndex: 50,
            }),
          }}
        />

        <button
          type="button"
          onClick={() => onChange({})}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}