"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { MapPoint, MapPointType } from "@/src/types/map";

type Props = {
  points: MapPoint[];
};

type PopupField = {
  label: string;
  getValue: (point: MapPoint) => string | number | null | undefined;
};

const JUNIN_CENTER: [number, number] = [-11.7, -75.3];


const popupFieldsByType: Record<MapPointType, PopupField[]> = {
  centro_poblado: [
    {
      label: "Nombre",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "Centro Poblado",
    },
    {
      label: "Ubigeo",
      getValue: (p) => p.centroPoblado?.ubigeo,
    },
    {
      label: "Poblacion",
      getValue: (p) => (p.raw as { poblacion?: string | number })?.poblacion,
    },
  ],

  fuente: [
    {
      label: "Nombre",
      getValue: (p) => (p.raw as { nombFuente?: string | number })?.nombFuente,
    },
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoFuenteAgua?: string | number })?.tipoFuenteAgua,
    },
    {
      label: "Subtipo",
      getValue: (p) => (p.raw as { subTipoFuente
?: string | number })?.subTipoFuente
,
    },
    {
      label: "Prestador",
      getValue: (p) => p.prestador?.nombre,
    },
    {
      label: "Centro poblado",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "Fuente",
    },
  ],

  captacion: [
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoCaptacion?: string | number })?.tipoCaptacion,
    },
    {
      label: "Estado operativo",
      getValue: (p) => p.estadoOperativo,
    },
    {
      label: "Estado físico",
      getValue: (p) => p.estadoFisico,
    },
    {
      label: "Prestador",
      getValue: (p) => p.prestador?.nombre,
    },
    {
      label: "Centro poblado",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "Captación",
    },
  ],

  ptap: [
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoPtap?: string | number })?.tipoPtap
,
    },
    {
      label: "Estado operativo",
      getValue: (p) => p.estadoOperativo,
    },
    {
      label: "Estado físico",
      getValue: (p) => p.estadoFisico,
    },
    {
      label: "Prestador",
      getValue: (p) => p.prestador?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "PTAP",
    },
    
  ],

  reservorio: [
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoReservorio?: string | number })?.tipoReservorio,
    },
    {
      label: "Volumen",
      getValue: (p) => (p.raw as { volumen?: string | number })?.volumen,
    },
    {
      label: "Estado operativo",
      getValue: (p) => p.estadoOperativo,
    },
     {
      label: "Antiguedad (Años)",
      getValue: (p) => (p.raw as { antiguedad?: string | number })?.antiguedad,
    },
    {
      label: "Estado físico",
      getValue: (p) => p.estadoFisico,
    },
    {
      label: "Centro poblado",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Prestador",
      getValue: (p) => p.prestador?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "Reservorio",
    },
  ],

  ptar: [
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoPtar?: string | number })?.tipoPtar,
    },
    {
      label: "Antiguedad (Años)",
      getValue: (p) => (p.raw as { antiguedad?: string | number })?.antiguedad,
    },
    {
      label: "Estado operativo",
      getValue: (p) => p.estadoOperativo,
    },
    {
      label: "Estado físico",
      getValue: (p) => p.estadoFisico,
    },
    {
      label: "Prestador",
      getValue: (p) => p.prestador?.nombre,
    },
    {
      label: "Centro poblado",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "PTAR",
    },
  ],

  disposicion_final: [
    {
      label: "Nombre",
      getValue: (p) => (p.raw as { nombFuenteVert?: string | number })?.nombFuenteVert,
    },
    {
      label: "Tipo",
      getValue: (p) => (p.raw as { tipoDispo?: string | number })?.tipoDispo,
    },
    {
      label: "Centro poblado",
      getValue: (p) => p.centroPoblado?.nombre,
    },
    {
      label: "Categoría",
      getValue: (p) => "Vertimiento",
    },
  ],
};

function createDivIcon(type: MapPointType) {
  const colorByType: Record<MapPointType, string> = {
    fuente: "#2563eb",
    captacion: "#16a34a",
    ptap: "#7c3aed",
    reservorio: "#f97316",
    ptar: "#dc2626",
    disposicion_final: "#111827",
    centro_poblado: "#f9019a",
  };

  const labelByType: Record<MapPointType, string> = {
    fuente: "F",
    captacion: "C",
    ptap: "P",
    reservorio: "R",
    ptar: "T",
    disposicion_final: "D",
    centro_poblado: "CP",
  };

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 9999px;
        background: ${colorByType[type]};
        color: white;
        border: 2px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
      ">
        ${labelByType[type]}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );

    if (validPoints.length === 0) return;

    const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));

    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 15,
    });
  }, [points, map]);

  return null;
}

function MarkerPopup({ point }: { point: MapPoint }) {
  const fields = popupFieldsByType[point.type] ?? [];

  return (
    <div className="min-w-[220px]">

      {fields.map((field) => {
        const value = field.getValue(point);

        if (value === null || value === undefined || value === "") {
          return null;
        }

        return (
          <p key={field.label} className="text-sm">
            <strong>{field.label}:</strong> {value}
          </p>
        );
      })}

      <p className="mt-2 text-xs text-slate-500">
        {point.lat}, {point.lng}
      </p>
    </div>
  );
}

function NoLeafletPrefix() {
  const map = useMap();

  useEffect(() => {
    if (!map.attributionControl) return;

    map.attributionControl.setPrefix(false);
  }, [map]);

  return null;
}

export default function InfraMap({ points }: Props) {
  const markers = useMemo(() => {
    return points.filter(
      (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
    );
  }, [points]);

  console.log(points)

  return (
    <MapContainer
      center={JUNIN_CENTER}
      zoom={8}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <NoLeafletPrefix />
      <TileLayer
        attribution="CAMI YAKU - &copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds points={markers} />

      {markers.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={createDivIcon(point.type)}
        >
          <Popup>
            <MarkerPopup point={point} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}