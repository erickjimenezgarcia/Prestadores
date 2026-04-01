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
  cant_usuarios: number | 0;
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
  const [dep, setDep] = useState<string>("JUNIN");

  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  const [loadingMarkers, setLoadingMarkers] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InfraDetail | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombres: "", apellidos: "", correo: "", telefono: "" });
  const [saving, setSaving] = useState(false);
  const depNorm = useMemo(() => normalizeDep(dep), [dep]);
  useEffect(() => setMounted(true), []);

  const [depUser, setDepUser] = useState("JUNIN");
const [provUser, setProvUser] = useState("");
const [distUser, setDistUser] = useState("");

const [provinciasUser, setProvinciasUser] = useState<string[]>([]);
const [distritosUser, setDistritosUser] = useState<string[]>([]);

const [loadingProvUser, setLoadingProvUser] = useState(false);
const [loadingDistUser, setLoadingDistUser] = useState(false);

const [massModalOpen, setMassModalOpen] = useState(false);
const [massSaving, setMassSaving] = useState(false);

const [massForm, setMassForm] = useState({
  nombres: "",
  apellidos: "",
  correo: "",
  telefono: "",
});



type InfraMassItem = {
  objectid: string;
  nombre?: string | null;
  prestador?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  hasUser: boolean;
  usuariosCount: number;
};

const [massItems, setMassItems] = useState<InfraMassItem[]>([]);
const [loadingMassItems, setLoadingMassItems] = useState(false);

const openMassModal = () => {
  setMassForm({ nombres: "", apellidos: "", correo: "", telefono: "" });
  setMassModalOpen(true);
};

const closeMassModal = () => {
  if (massSaving) return;
  setMassModalOpen(false);
  setMassForm({ nombres: "", apellidos: "", correo: "", telefono: "" });
};





const loadProvinciasUser = async (departamento: string) => {
  if (!departamento) {
    setProvinciasUser([]);
    return;
  }

  setLoadingProvUser(true);
  try {
    const res = await fetch(
      `/api/infra/provincias?departamento=${encodeURIComponent(departamento)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudieron obtener provincias");
    }

    setProvinciasUser(data.items ?? []);
  } catch (e) {
    console.error(e);
    setProvinciasUser([]);
  } finally {
    setLoadingProvUser(false);
  }
};

const loadDistritosUser = async (departamento: string, provincia: string) => {
  if (!departamento || !provincia) {
    setDistritosUser([]);
    return;
  }

  setLoadingDistUser(true);
  try {
    const res = await fetch(
      `/api/infra/distritos?departamento=${encodeURIComponent(departamento)}&provincia=${encodeURIComponent(provincia)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudieron obtener distritos");
    }

    setDistritosUser(data.items ?? []);
  } catch (e) {
    console.error(e);
    setDistritosUser([]);
  } finally {
    setLoadingDistUser(false);
  }
};

const loadMassItems = async (
  departamento: string,
  provincia?: string,
  distrito?: string
) => {
  if (!departamento) {
    setMassItems([]);
    return;
  }

  setLoadingMassItems(true);
  try {
    const params = new URLSearchParams();
    params.set("departamento", departamento);
    if (provincia) params.set("provincia", provincia);
    if (distrito) params.set("distrito", distrito);

    const res = await fetch(`/api/infra/by-scope?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudieron cargar infraestructuras");
    }

    setMassItems(data.items ?? []);
  } catch (e) {
    console.error(e);
    setMassItems([]);
  } finally {
    setLoadingMassItems(false);
  }
};

useEffect(() => {
  setProvUser("");
  setDistUser("");
  setDistritosUser([]);
  loadProvinciasUser(depUser);
}, [depUser]);

useEffect(() => {
  setDistUser("");

  if (provUser) {
    loadDistritosUser(depUser, provUser);
  } else {
    setDistritosUser([]);
  }
}, [depUser, provUser]);

useEffect(() => {
  loadMassItems(depUser, provUser || undefined, distUser || undefined);
}, [depUser, provUser, distUser]);

  const handleDeleteUser = async (
  objectid: string | number,
  userId: string | number
) => {
  const ok = window.confirm("¿Seguro que deseas quitar este responsable de este punto?");
  if (!ok) return;

  try {
    const res = await fetch(
      `/api/infra/${encodeURIComponent(String(objectid))}/usuarios/${encodeURIComponent(String(userId))}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo eliminar la relación");
    }

    if (selectedId) {
      await loadDetail(selectedId);
    }
    await loadMarkers(depNorm);

  } catch (e: any) {
    alert(`Error eliminando responsable: ${String(e?.message ?? e)}`);
  }
};

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
  setEditingUserId(null);
  setForm({ nombres: "", apellidos: "", correo: "", telefono: "" });
  setModalOpen(true);
};

const openEditModal = (u: any) => {
  setEditingUserId(String(u.id));
  setForm({
    nombres: u.nombres ?? "",
    apellidos: u.apellidos ?? "",
    correo: u.correo ?? "",
    telefono: u.telefono ?? "",
  });
  setModalOpen(true);
};

const closeModal = () => {
  if (saving) return;
  setModalOpen(false);
  setEditingUserId(null);
  setForm({ nombres: "", apellidos: "", correo: "", telefono: "" });
};

  const saveUser = async () => {
  if (!selectedId) return;

  setSaving(true);
  try {
    const isEdit = !!editingUserId;

    const url = isEdit
      ? `/api/usuarios/${encodeURIComponent(editingUserId)}`
      : `/api/infra/${encodeURIComponent(selectedId)}/usuarios`;

    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
      }),
    });

    let errorText = "";
    if (!res.ok) {
      try {
        const data = await res.json();
        errorText = data?.error || JSON.stringify(data);
      } catch {
        errorText = await res.text();
      }
      throw new Error(errorText || "No se pudo guardar el usuario");
    }

    closeModal();
    setEditingUserId(null);
    setForm({ nombres: "", apellidos: "", correo: "", telefono: "" });

    await loadDetail(selectedId);
    await loadMarkers(depNorm);
  } catch (e: any) {
    alert(`Error guardando usuario: ${String(e?.message ?? e)}`);
  } finally {
    setSaving(false);
  }
};

const saveMassUser = async () => {
  if (massItems.length === 0) return;

  setMassSaving(true);
  try {
    const res = await fetch(`/api/infra/usuarios-masivo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        objectids: massItems.map((x) => x.objectid),
        nombres: massForm.nombres.trim(),
        apellidos: massForm.apellidos.trim(),
        correo: massForm.correo.trim().toLowerCase(),
        telefono: massForm.telefono.trim() || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "No se pudo realizar la asignación masiva");
    }

    closeMassModal();

    // refresca la sección masiva
    await loadMassItems(depUser, provUser || undefined, distUser || undefined);

    // refresca mapa/detalle antiguos por si un punto visible cambió a verde
    await loadMarkers(depNorm);
    if (selectedId) {
      await loadDetail(selectedId);
    }

    alert(`Asignación masiva completada. Asociado a ${data?.count ?? 0} infraestructura(s).`);
  } catch (e: any) {
    alert(`Error en asignación masiva: ${String(e?.message ?? e)}`);
  } finally {
    setMassSaving(false);
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

        <hr style={{ margin: "14px 0", borderColor: "#243041" }} />

        <div style={{ marginTop: 6 }}>
  <div style={{ fontSize: 14, fontWeight: 800, color: "#e5e7eb", marginBottom: 10 }}>
    Añadir usuarios en masa
  </div>

  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
    Filtra infraestructuras por ubicación para asignar responsables en lote.
  </div>

  <label style={{ display: "block", fontSize: 12, marginBottom: 6 }}>Departamento</label>
  <select
    value={depUser}
    onChange={(e) => setDepUser(e.target.value)}
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

  <label style={{ display: "block", fontSize: 12, marginTop: 12, marginBottom: 6 }}>
    Provincia
  </label>
  <select
    value={provUser}
    onChange={(e) => setProvUser(e.target.value)}
    className="ui-select"
    disabled={!depUser || loadingProvUser}
  >
    <option value="">{loadingProvUser ? "Cargando provincias..." : "Todas"}</option>
    {provinciasUser.map((p) => (
      <option key={p} value={p}>{p}</option>
    ))}
  </select>

  <label style={{ display: "block", fontSize: 12, marginTop: 12, marginBottom: 6 }}>
    Distrito
  </label>
  <select
    value={distUser}
    onChange={(e) => setDistUser(e.target.value)}
    className="ui-select"
    disabled={!provUser || loadingDistUser}
  >
    <option value="">{loadingDistUser ? "Cargando distritos..." : "Todos"}</option>
    {distritosUser.map((d) => (
      <option key={d} value={d}>{d}</option>
    ))}
  </select>

  <div style={{ marginTop: 12, fontSize: 12, color: "#94a3b8" }}>
    {loadingMassItems ? "Buscando infraestructuras..." : `Resultados: ${massItems.length}`}
  </div>

  {/* <div
    style={{
      marginTop: 12,
      maxHeight: 280,
      overflow: "auto",
      display: "grid",
      gap: 8,
    }}
  >
    {massItems.length === 0 ? (
      <div style={{ fontSize: 12, color: "#94a3b8" }}>
        No se encontraron infraestructuras para los filtros seleccionados.
      </div>
    ) : (
      massItems.map((item) => (
        <div
          key={item.objectid}
          className="ui-card"
          style={{
            padding: 10,
            border: "1px solid #243041",
            borderRadius: 12,
            background: "#111827",
          }}
        >
          <div style={{ fontWeight: 700, color: "#e5e7eb", fontSize: 13 }}>
            {item.nombre || `Infraestructura ${item.objectid}`}
          </div>

          <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8" }}>
            {item.prestador ?? "-"}
          </div>

          <div style={{ marginTop: 4, fontSize: 12, color: "#94a3b8" }}>
            {item.provincia ?? "-"} / {item.distrito ?? "-"}
          </div>

          <div style={{ marginTop: 6, fontSize: 12, color: item.hasUser ? "#22c55e" : "#ef4444" }}>
            {item.hasUser
              ? `Con usuarios (${item.usuariosCount})`
              : "Sin usuarios"}
          </div>
        </div>
      ))
    )}
  </div> */}

  <div style={{ marginTop: 12 }}>
    <button
      type="button"
      className="ui-btn ui-btn-primary"
      style={{ width: "100%" }}
      disabled={massItems.length === 0}
      onClick={openMassModal}
    >
      Continuar con asignación masiva
    </button>
  </div>
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
            {/* <div style={{ fontSize: 12, color: "#94a3b8" }}>OBJECTID</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: "#e5e7eb" }}>
              {detail.objectid}
            </div> */}

            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#e5e7eb" }}>
              <div><b>Nombre:</b> {detail.nombre ?? "-"}</div>
              <div><b>Prestador:</b> {detail.prestador ?? "-"}</div>
              <div><b>Tipo fuente:</b> {detail.tipodefuen ?? "-"}</div>
              <div><b>Tipo captacion:</b> {detail.tipoCap ?? "-"}</div>
              <div><b>Tipo infraestructura:</b> {detail.tipoInfra ?? "-"}</div>
              <div><b>Cantidad Usuarios:</b> {detail.cant_usuarios ?? "0"}</div>
              <div><b>Dep:</b> {detail.departamen ?? "-"}</div>
              <div><b>Prov:</b> {detail.provincia ?? "-"}</div>
              <div><b>Dist:</b> {detail.distrito ?? "-"}</div>
            </div>

            <hr style={{ margin: "14px 0", borderColor: "#243041" }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom:"1rem" }}>
              <h4 style={{ margin: 0, color: "#e5e7eb" }}>Responsables</h4>

              <button onClick={openModal} className="ui-btn ui-btn-primary" style={{ fontSize: 13 }}>
                Añadir responsable
              </button>
            </div>

            {detail.usuarios.map((u) => (
  <div
    key={u.id}
    className="ui-card"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom:"1rem",
      gap: 8,
    }}
  >
    <div>
      <div style={{ fontWeight: 800 }}>
        {u.nombres} {u.apellidos}
      </div>
      <div style={{ fontSize: 13 }}>{u.correo}</div>
      <div style={{ fontSize: 13, color: "#94a3b8" }}>
        {u.telefono ?? "-"}
      </div>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      <button
        type="button"
        onClick={() => openEditModal(u)}
        title="Editar responsable"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid #334155",
          background: "#111827",
          color: "#e5e7eb",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: 14,
        }}
      >
        ✏️
      </button>

      <button
        type="button"
        onClick={() => handleDeleteUser(detail.objectid, u.id)}
        title="Eliminar responsable"
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: "1px solid #7f1d1d",
          background: "#111827",
          color: "#ef4444",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: 14,
        }}
      >
        🗑️
      </button>
    </div>
  </div>
))}
          </>
        )}
      </aside>

      {/* Modal */}
      {modalOpen && (
        <div
          onClick={() => !saving && closeModal()}
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
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
  {editingUserId ? "Editar responsable" : "Registrar responsable"}
</div>
<div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
  {editingUserId
    ? "Actualiza los datos del responsable asociado a este punto."
    : "Vincula un responsable a este punto para enviar alertas cuando suba el nivel."}
</div>

              <button
                onClick={() => !saving && closeModal()}
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
                    onClick={() => closeModal()}
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
                    {saving ? "Guardando..." : editingUserId ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {massModalOpen && (
  <div
    onClick={() => !massSaving && closeMassModal()}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10000,
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
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #eef2f7",
          background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
          Asignación masiva de responsable
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: "#64748b" }}>
          Se asignará este responsable a {massItems.length} infraestructura(s) filtrada(s).
        </div>
      </div>

      <div style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "#475569" }}>
              Nombres
            </label>
            <input
              style={inputModernStyle}
              value={massForm.nombres}
              onChange={(e) => setMassForm((s) => ({ ...s, nombres: e.target.value }))}
              placeholder="Nombres"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "#475569" }}>
              Apellidos
            </label>
            <input
              style={inputModernStyle}
              value={massForm.apellidos}
              onChange={(e) => setMassForm((s) => ({ ...s, apellidos: e.target.value }))}
              placeholder="Apellidos"
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "#475569" }}>
            Correo
          </label>
          <input
            type="email"
            style={inputModernStyle}
            value={massForm.correo}
            onChange={(e) => setMassForm((s) => ({ ...s, correo: e.target.value }))}
            placeholder="correo@dominio.com"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 6, color: "#475569" }}>
            Teléfono
          </label>
          <input
            style={inputModernStyle}
            value={massForm.telefono}
            onChange={(e) => setMassForm((s) => ({ ...s, telefono: e.target.value }))}
            placeholder="987654321"
          />
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 14,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#475569",
          }}
        >
          <b>Ámbito seleccionado:</b><br />
          Departamento: {depUser}<br />
          Provincia: {provUser || "Todas"}<br />
          Distrito: {distUser || "Todos"}<br />
          Resultados: {massItems.length}
        </div>
      </div>

      <div
        style={{
          padding: 16,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          borderTop: "1px solid #eef2f7",
          background: "#fff",
        }}
      >
        <button
          type="button"
          className="ui-btn"
          onClick={closeMassModal}
          disabled={massSaving}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="ui-btn ui-btn-primary"
          onClick={saveMassUser}
          disabled={
            massSaving ||
            !massForm.nombres.trim() ||
            !massForm.apellidos.trim() ||
            !massForm.correo.trim() ||
            massItems.length === 0
          }
        >
          {massSaving ? "Guardando..." : "Asignar a todos"}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}