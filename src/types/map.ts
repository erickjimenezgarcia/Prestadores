export type InfraLayer =
  | "fuentes"
  | "captaciones"
  | "ptaps"
  | "reservorios"
  | "ptars"
  | "disposicionesFinales";

export type MapPointType =
  |"centro_poblado"
  | "fuente"
  | "captacion"
  | "ptap"
  | "reservorio"
  | "ptar"
  | "disposicion_final";

export type MapPoint = {
  id: string;
  type: MapPointType;
  title: string | null;
  lat: number;
  lng: number;

  estadoOperativo?: string | null;
  estadoFisico?: string | null;

  prestador?: {
    id: number;
    nombre: string | null;
  } | null;

  centroPoblado?: {
    id: number;
    nombre: string | null;
    ubigeo?: string | null;
  } | null;

  sistema?: {
    id: number;
    nombre: string | null;
  } | null;

  raw?: unknown;
};

export type RegionFilters = {
  departamento?: string;
  provincia?: string;
  distrito?: string;
  idPrestador?: number;
  idsCentroP?: number[];
};