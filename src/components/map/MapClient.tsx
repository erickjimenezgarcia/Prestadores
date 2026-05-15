"use client";

import dynamic from "next/dynamic";

const MapShell = dynamic(() => import("@/src/components/map/MapShell"), {
  ssr: false,
});

export default function MapClient() {
  return <MapShell />;
}