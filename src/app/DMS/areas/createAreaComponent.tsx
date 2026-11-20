"use client"

import { useState } from "react";

// Server action de crear áreas
import { createArea } from "./areas.actions";

type CreateAreaStatus = "idle" | "creating" | "success" | "error";

/**
 * Formulario para crear un área. Solo pide el nombre; `created_by` y `created_at`
 * los resuelve el servidor.
 *
 * @param onCreated - se llama después de crear el área, para recargar la lista
 * @returns el formulario de nueva área
 * @example
 * <CreateAreaComponent onCreated={loadAreas} />
 */
export function CreateAreaComponent({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<CreateAreaStatus>("idle");

  const handleCreate = async () => {
    setError("");
    setStatus("creating");
    try {
      const result = await createArea(name.trim());
      if (result.ok === false) {
        setError(result.message);
        setStatus("error");
        return;
      }
      setName("");
      setStatus("success");
      onCreated();
    } catch (err) {
      // La action no lanza; esto es red caída o una action que no llegó al servidor.
      console.error("[handleCreate] error inesperado:", err);
      setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="area-name" className="block text-xs font-semibold mb-1.5 text-soma-brown">
          Nombre del área
        </label>
        <input
          id="area-name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Marketing"
          className="w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
        />
      </div>

      {status === "error" && (
        <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
      )}
      {status === "success" && (
        <p className="text-xs rounded-md px-3 py-2 text-soma-brown bg-soma-brown/10">Área creada.</p>
      )}

      <button
        type="button"
        onClick={handleCreate}
        disabled={!name.trim() || status === "creating"}
        className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white bg-soma-red disabled:opacity-50"
      >
        {status === "creating" ? "Creando..." : "Crear área"}
      </button>
    </div>
  );
}
