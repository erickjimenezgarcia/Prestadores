// @ts-nocheck
"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";


type MarkerItem = {
  objectid: string;
  x: number;
  y: number;
  hasUser: boolean;
};



type DeptView = { center: [number, number]; zoom: number };

// Centros/zoom aproximados (Perú). Ajusta lo que quieras.
const DEP_VIEWS: Record<string, DeptView> = {
  AMAZONAS: { center: [-6.2317, -77.8690], zoom: 8 },          // Chachapoyas
  ANCASH: { center: [-9.5278, -77.5270], zoom: 8 },            // Huaraz
  APURIMAC: { center: [-13.6339, -72.8839], zoom: 9 },         // Abancay
  AREQUIPA: { center: [-16.3989, -71.5350], zoom: 9 },         // Arequipa
  AYACUCHO: { center: [-13.1631, -74.2236], zoom: 9 },         // Ayacucho
  CAJAMARCA: { center: [-7.1617, -78.5128], zoom: 8 },         // Cajamarca
  CUSCO: { center: [-13.5319, -71.9675], zoom: 9 },            // Cusco
  HUANCAVELICA: { center: [-12.7860, -74.9760], zoom: 9 },     // Huancavelica
  HUANUCO: { center: [-9.9306, -76.2422], zoom: 9 },           // Huánuco
  ICA: { center: [-14.0678, -75.7286], zoom: 9 },              // Ica
  JUNIN: { center: [-11.1582, -75.9926], zoom: 8 },            // Huancayo (aprox)
  LA_LIBERTAD: { center: [-8.11599, -79.02998], zoom: 9 },     // Trujillo
  LAMBAYEQUE: { center: [-6.7714, -79.8409], zoom: 10 },       // Chiclayo
  LIMA: { center: [-12.0464, -77.0428], zoom: 9 },             // Lima
  LORETO: { center: [-3.7437, -73.2516], zoom: 7 },            // Iquitos (muy grande => zoom menor)
  MADRE_DE_DIOS: { center: [-12.5933, -69.1891], zoom: 9 },    // Puerto Maldonado
  MOQUEGUA: { center: [-17.1939, -70.9350], zoom: 10 },        // Moquegua
  PASCO: { center: [-10.6833, -76.2567], zoom: 9 },            // Cerro de Pasco
  PIURA: { center: [-5.1945, -80.6328], zoom: 9 },             // Piura
  PUNO: { center: [-15.8402, -70.0219], zoom: 8 },             // Puno
  SAN_MARTIN: { center: [-6.4983, -76.3725], zoom: 8 },        // Moyobamba/Tarapoto (aprox)
  TACNA: { center: [-18.0066, -70.2463], zoom: 10 },           // Tacna
  TUMBES: { center: [-3.5669, -80.4515], zoom: 10 },           // Tumbes
  UCAYALI: { center: [-8.3791, -74.5539], zoom: 8 },           // Pucallpa

  // Provincia Constitucional (si en tu data aparece)
  CALLAO: { center: [-12.0600, -77.1300], zoom: 11 },

  // fallback: Perú
  __DEFAULT__: { center: [-9.19, -75.015], zoom: 5 },
};

function FitToDept({ dep }: { dep: string }) {
  const map = useMap();

  useEffect(() => {
    if (!dep) return;

    const key = dep.toUpperCase().replace(/\s+/g, "_");
    const view = DEP_VIEWS[key] || DEP_VIEWS[dep.toUpperCase()] || DEP_VIEWS.__DEFAULT__;

    const applyView = () => {
      // por si quedó una animación colgada
      try {
        map.stop();
        map.setView(view.center, view.zoom, { animate: false }); // ✅ sin animación = no rompe
        // importante si el contenedor cambió tamaño
        setTimeout(() => map.invalidateSize(), 0);
      } catch {}
    };

    if ((map as any)._loaded) applyView();
    else map.whenReady(applyView);
  }, [dep, map]);

  return null;
}

export default function InfraMap({
  dep,
  markers,
  selectedId,
  onSelect,
}: {
  dep: string;
  markers: MarkerItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const initial = useMemo(() => DEP_VIEWS.__DEFAULT__, []);

function NoLeafletPrefix() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(""); // ✅ quita "Leaflet"
  }, [map]);
  return null;
}

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={initial.center}
        zoom={initial.zoom}
        style={{ height: "100%", width: "100%" }}
        preferCanvas={true}
      >
        <NoLeafletPrefix />
        <FitToDept dep={dep} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((m) => {
          const isSel = selectedId === m.objectid;
          return (
            <CircleMarker
              key={m.objectid}
              center={[m.y, m.x]} // Leaflet usa [lat, lng] => y=lat, x=lng
              radius={isSel ? 9 : 6}
              pathOptions={{
                color: m.hasUser ? "green" : "red",
                fillColor: m.hasUser ? "green" : "red",
                fillOpacity: 0.8,
                weight: isSel ? 3 : 1,
              }}
              eventHandlers={{
                click: () => onSelect(m.objectid),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}