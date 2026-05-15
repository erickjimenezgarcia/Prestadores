"use client";

import { useEffect, useState } from "react";

type UsuarioPrestador = {
  idRelacion: number;
  idUsuario: number;
  idPrestador: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  createdAt?: string;
  updatedAt?: string;
};

type UsuarioForm = {
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
};

type Props = {
  idPrestador?: number;
};

const EMPTY_FORM: UsuarioForm = {
  nombres: "",
  apellidos: "",
  telefono: "",
  correo: "",
};

export default function Usuarios({ idPrestador }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioPrestador[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioPrestador | null>(null);
  const [form, setForm] = useState<UsuarioForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, [idPrestador]);

  async function loadUsuarios() {
    if (!idPrestador) {
      setUsuarios([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/usuarios/prestador?idPrestador=${idPrestador}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Error cargando usuarios");
      }

      setUsuarios(json.data ?? []);
    } catch (error) {
      console.error("Error usuarios:", error);
      setUsuarios([]);
      setError(error instanceof Error ? error.message : "Error cargando usuarios");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError(null);
    setOpenModal(true);
  }

  function openEditModal(usuario: UsuarioPrestador) {
    setEditingUser(usuario);
    setForm({
      nombres: usuario.nombres ?? "",
      apellidos: usuario.apellidos ?? "",
      telefono: usuario.telefono ?? "",
      correo: usuario.correo ?? "",
    });
    setError(null);
    setOpenModal(true);
  }

  function closeModal() {
    if (saving) return;

    setOpenModal(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function handleChange(field: keyof UsuarioForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!form.nombres.trim()) return "Ingresa los nombres.";
    if (!form.apellidos.trim()) return "Ingresa los apellidos.";
    if (!form.telefono.trim()) return "Ingresa el teléfono.";
    if (!form.correo.trim()) return "Ingresa el correo.";

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim());

    if (!correoValido) return "Ingresa un correo válido.";

    return null;
  }

  async function handleSubmit() {
    if (!idPrestador) return;

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = editingUser ? "/api/usuarios" : "/api/usuarios/prestador";
      const method = editingUser ? "PUT" : "POST";

      const body = editingUser
        ? {
            idUsuario: editingUser.idUsuario,
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            telefono: form.telefono.trim(),
            correo: form.correo.trim().toLowerCase(),
          }
        : {
            idPrestador,
            nombres: form.nombres.trim(),
            apellidos: form.apellidos.trim(),
            telefono: form.telefono.trim(),
            correo: form.correo.trim().toLowerCase(),
          };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Error guardando usuario");
      }

      closeModal();
      await loadUsuarios();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      setError(error instanceof Error ? error.message : "Error guardando usuario");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(usuario: UsuarioPrestador) {
    const ok = window.confirm(
      `¿Seguro que deseas eliminar a ${usuario.nombres} ${usuario.apellidos}?`
    );

    if (!ok) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/usuarios?idUsuario=${usuario.idUsuario}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Error eliminando usuario");
      }

      await loadUsuarios();
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setError(error instanceof Error ? error.message : "Error eliminando usuario");
    } finally {
      setLoading(false);
    }
  }

  if (!idPrestador) {
    return (
      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="map-section-title">Responsables</h3>

          <button
            type="button"
            disabled
            className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-400"
          >
            Añadir
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Selecciona un prestador para ver o registrar responsables.
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h3 className="map-section-title">Responsables</h3>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
        >
          Añadir
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-2 text-sm text-slate-500">Cargando responsables...</p>
      )}

      {!loading && usuarios.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">
          No hay responsables registrados para este prestador.
        </p>
      )}

      <div className="mt-3 space-y-2">
        {usuarios.map((usuario) => (
          <div
            key={usuario.idUsuario}
            className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">
                  {usuario.nombres} {usuario.apellidos}
                </p>

                <p className="text-xs text-slate-500">{usuario.correo}</p>
                <p className="text-xs text-slate-500">{usuario.telefono}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(usuario)}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(usuario)}
                  className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-slate-800">
                {editingUser ? "Editar responsable" : "Registrar responsable"}
              </h4>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Nombres
                </label>
                <input
                  value={form.nombres}
                  onChange={(e) => handleChange("nombres", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  placeholder="Ej. Juan Carlos"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Apellidos
                </label>
                <input
                  value={form.apellidos}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  placeholder="Ej. Pérez Ramos"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Teléfono
                </label>
                <input
                  value={form.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  placeholder="Ej. 999888777"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Correo
                </label>
                <input
                  value={form.correo}
                  onChange={(e) => handleChange("correo", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  placeholder="Ej. usuario@correo.com"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {saving ? "Guardando..." : editingUser ? "Actualizar" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}