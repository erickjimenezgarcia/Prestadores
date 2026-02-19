"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const InfraMap = dynamic(() => import("./components/InfraMap"), { ssr: false });



type MarkerItem = {
  objectid: string;
  x: number;
  y: number;
  hasUser: boolean;
};

type Usuario = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
};

type InfraDetail = {
  objectid: string;
  tipoCap?: string | null;
  tipodefuen?: string | null;
  epsCorrec?: string | null;
  nombre?: string | null;
  prestador?: string | null;
  x?: number | null;
  y?: number | null;
  tipoPrest?: string | null;
  tipoInfra?: string | null;
  departamen?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  hasUser: boolean;
  usuarios: Usuario[];
};

function normalizeDep(dep: string) {
  return dep.trim().toUpperCase();
}

const inputModernStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  color: "#0f172a",
  outline: "none",
  fontSize: 14,
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [dep, setDep] = useState<string>("LIMA");

  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [loadingMarkers, setLoadingMarkers] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InfraDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombres: "", apellidos: "", correo: "", telefono: "" });
  const [saving, setSaving] = useState(false);
  const depNorm = useMemo(() => normalizeDep(dep), [dep]);
  useEffect(() => setMounted(true), []);

  async function loadMarkers(depValue: string) {
    setLoadingMarkers(true);
    setMarkers([]);
    setSelectedId(null);
    setDetail(null);

    try {
      const res = await fetch(`/api/infra/by-dep?dep=${encodeURIComponent(depValue)}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setMarkers(json.data ?? []);
    } finally {
      setLoadingMarkers(false);
    }
  }

  async function loadDetail(id: string) {
    setLoadingDetail(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/infra/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setDetail(json);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadMarkers(depNorm);
  }, [depNorm]);

  const onSelectPoint = (id: string) => {
    setSelectedId(id);
    loadDetail(id);
  };

  const openModal = () => {
    setForm({ nombres: "", apellidos: "", correo: "", telefono: "" });
    setModalOpen(true);
  };

  const saveUser = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/infra/${encodeURIComponent(selectedId)}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: form.nombres,
          apellidos: form.apellidos,
          correo: form.correo,
          telefono: form.telefono || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setModalOpen(false);
      // refrescar detalle y marcadores (para que el punto cambie a verde)
      await loadDetail(selectedId);
      await loadMarkers(depNorm);
    } catch (e: any) {
      alert(`Error guardando usuario: ${String(e?.message ?? e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateRows: "64px 1fr" }}>
    {/* HEADER */}
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 2000,
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid #243041",
        background: "#0b0f14",
      }}
    >
      {/* Logo izquierdo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logos/logo1.png"
          alt="Logo 1"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
      </div>

      {/* Título centrado */}
      <div style={{ textAlign: "center", lineHeight: 1.1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#e5e7eb" }}>
          VISOR DE INFRAESTRUCTURA
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          Responsable por punto • Alertas • Seguimiento
        </div>
      </div>

      {/* Logo derecho */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        <img
          src="/logos/logo2.png"
          alt="Logo 2"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
        />
      </div>
    </header>

    {/* BODY: tu grid actual */}
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "320px 1fr 360px" }}>
      {/* Left: filtros */}
      <aside className="ui-panel" style={{ borderRight: "1px solid #243041", padding: 16, overflow: "auto" }}>
        <h3 style={{ margin: "0 0 12px" }}>Filtros</h3>

        <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Departamento</label>
        <select
          value={dep}
          onChange={(e) => setDep(e.target.value)}
          className="ui-select"
        >
          {[
            "AMAZONAS","ANCASH","APURIMAC","AREQUIPA","AYACUCHO","CAJAMARCA","CUSCO",
            "HUANCAVELICA","HUANUCO","ICA","JUNIN","LA LIBERTAD","LAMBAYEQUE","LIMA",
            "LORETO","MADRE DE DIOS","MOQUEGUA","PASCO","PIURA","PUNO","SAN MARTIN",
            "TACNA","TUMBES","UCAYALI","CALLAO"
          ].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
          {loadingMarkers ? "Cargando puntos..." : `Puntos: ${markers.length}`}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          <div><span style={{ color: "#22c55e", fontWeight: 800 }}>●</span> Con usuario</div>
          <div><span style={{ color: "#ef4444", fontWeight: 800 }}>●</span> Sin usuario</div>
        </div>
      </aside>

      {/* Center: mapa */}
      <main style={{ position: "relative" }}>
        {mounted ? (
          <InfraMap dep={depNorm} markers={markers} selectedId={selectedId} onSelect={onSelectPoint} />
        ) : (
          <div style={{ height: "100%", width: "100%", display: "grid", placeItems: "center", color: "#94a3b8" }}>
            Cargando mapa…
          </div>
        )}

        {loadingMarkers && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#0f172a",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #243041",
              boxShadow: "0 2px 8px rgba(0,0,0,.25)",
              fontSize: 12,
              color: "#e5e7eb",
            }}
          >
            Cargando…
          </div>
        )}
      </main>

      {/* Right: detalle */}
      <aside className="ui-panel" style={{ borderLeft: "1px solid #243041", padding: 16, overflow: "auto" }}>
        <h3 style={{ margin: "0 0 12px" }}>Detalle</h3>

        {!selectedId && <div style={{ color: "#94a3b8", fontSize: 13 }}>Selecciona un punto en el mapa.</div>}
        {selectedId && loadingDetail && <div style={{ color: "#94a3b8", fontSize: 13 }}>Cargando detalle…</div>}

        {selectedId && detail && (
          <>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>OBJECTID</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#e5e7eb" }}>
              {detail.objectid}
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#e5e7eb" }}>
              <div><b>Nombre:</b> {detail.nombre ?? "-"}</div>
              <div><b>Prestador:</b> {detail.prestador ?? "-"}</div>
              <div><b>EPS corr.:</b> {detail.epsCorrec ?? "-"}</div>
              <div><b>Tipo infra:</b> {detail.tipoInfra ?? "-"}</div>
              <div><b>Tipo cap:</b> {detail.tipoCap ?? "-"}</div>
              <div><b>Tipodefuen:</b> {detail.tipodefuen ?? "-"}</div>
              <div><b>Dep:</b> {detail.departamen ?? "-"}</div>
              <div><b>Prov:</b> {detail.provincia ?? "-"}</div>
              <div><b>Dist:</b> {detail.distrito ?? "-"}</div>
              <div><b>Coords:</b> {detail.y ?? "-"}, {detail.x ?? "-"}</div>
            </div>

            <hr style={{ margin: "14px 0", borderColor: "#243041" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, color: "#e5e7eb" }}>Responsable</h4>
              {!detail.hasUser && (
                <button onClick={openModal} className="ui-btn ui-btn-primary" style={{ fontSize: 13 }}>
                  Añadir responsable
                </button>
              )}
            </div>

            {detail.usuarios.length === 0 ? (
              <div style={{ marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
                Este punto aún no tiene usuarios registrados.
              </div>
            ) : (
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {detail.usuarios.map((u) => (
                  <div key={u.id} className="ui-card">
                    <div style={{ fontWeight: 800 }}>{u.nombres} {u.apellidos}</div>
                    <div style={{ fontSize: 13 }}>{u.correo}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>{u.telefono ?? "-"}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </aside>

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={() => !saving && setModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(2,6,23,.55)",
            backdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(620px, 100%)",
              borderRadius: 20,
              background: "#ffffff",
              boxShadow: "0 24px 80px rgba(0,0,0,.35)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #eef2f7",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  Registrar responsable
                </div>
                <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
                  Vincula un responsable a este punto para enviar alertas cuando suba el nivel.
                </div>
              </div>

              <button
                onClick={() => !saving && setModalOpen(false)}
                aria-label="Cerrar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "grid",
                  placeItems: "center",
                  color: "#0f172a",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: 26,  // ✅ más espacio entre columnas
                  rowGap: 18,    // ✅ más aire entre filas
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Nombres
                  </label>
                  <input
                    value={form.nombres}
                    onChange={(e) => setForm((s) => ({ ...s, nombres: e.target.value }))}
                    placeholder="Ej: Juan Carlos"
                    autoFocus
                    style={inputModernStyle}
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Apellidos
                  </label>
                  <input
                    value={form.apellidos}
                    onChange={(e) => setForm((s) => ({ ...s, apellidos: e.target.value }))}
                    placeholder="Ej: Pérez Gómez"
                    style={inputModernStyle}
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Correo
                  </label>
                  <input
                    value={form.correo}
                    onChange={(e) => setForm((s) => ({ ...s, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    inputMode="email"
                    style={inputModernStyle}
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                    Teléfono (opcional)
                  </label>
                  <input
                    value={form.telefono}
                    onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))}
                    placeholder="Ej: 999 999 999"
                    inputMode="tel"
                    style={inputModernStyle}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Al guardar, el punto pasará a <b>verde</b>.
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    disabled={saving}
                    onClick={() => setModalOpen(false)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    disabled={
                      saving ||
                      !form.nombres.trim() ||
                      !form.apellidos.trim() ||
                      !form.correo.trim()
                    }
                    onClick={saveUser}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #16a34a",
                      background:
                        saving ||
                          !form.nombres.trim() ||
                          !form.apellidos.trim() ||
                          !form.correo.trim()
                          ? "#a7f3d0"
                          : "#16a34a",
                      color: "#fff",
                      cursor:
                        saving ||
                          !form.nombres.trim() ||
                          !form.apellidos.trim() ||
                          !form.correo.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 800,
                      boxShadow: "0 10px 30px rgba(22,163,74,.25)",
                    }}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}