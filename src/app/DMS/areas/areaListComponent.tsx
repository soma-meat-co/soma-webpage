"use client"

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import type { Area } from "@/lib/core/areas/provider/areas.provider";

// Server actions de áreas
import { deleteArea, editArea } from "./areas.actions";

type Mode = "view" | "editing" | "confirmDelete";
type ItemStatus = "idle" | "saving" | "error";

/**
 * Fila de un área: muestra su nombre y permite renombrarla o borrarla. Borrar
 * pide confirmación en la misma fila. Tras guardar o borrar llama `onChanged`
 * y la lista llega actualizada por props.
 *
 * @param area - el área a mostrar
 * @param onChanged - se llama después de editar o borrar, para recargar la lista
 * @returns la fila del área
 * @example
 * <AreaItem area={area} onChanged={loadAreas} />
 */
function AreaItem({ area, onChanged }: { area: Area; onChanged: () => void }) {
  const [mode, setMode] = useState<Mode>("view");
  const [status, setStatus] = useState<ItemStatus>("idle");
  const [error, setError] = useState("");
  const [newName, setNewName] = useState(area.name);

  const resetTo = (next: Mode) => {
    setMode(next);
    setStatus("idle");
    setError("");
    setNewName(area.name);
  };

  const run = async (action: () => Promise<{ ok: true } | { ok: false; message: string }>) => {
    setError("");
    setStatus("saving");
    try {
      const result = await action();
      if (result.ok === false) {
        setError(result.message);
        setStatus("error");
        return;
      }
      resetTo("view");
      onChanged();
    } catch (err) {
      console.error("[AreaItem] error inesperado:", err);
      setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  };

  const saving = status === "saving";
  const iconButton = "shrink-0 p-1.5 rounded-md text-soma-gray hover:text-soma-brown disabled:opacity-50";

  return (
    <li className="space-y-2 rounded-md border border-[#DAD6CE] bg-white px-3 py-2 shadow-soma">
      <div className="flex items-center gap-2">
        {mode === "editing" ? (
          <input
            type="text"
            autoComplete="off"
            aria-label={`Nuevo nombre de ${area.name}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 h-8 px-2 rounded-md border border-[#DAD6CE] text-sm text-black outline-none focus:border-soma-red"
          />
        ) : (
          <span className="flex-1 text-sm text-soma-brown break-all">{area.name}</span>
        )}

        {mode === "view" && (
          <>
            <button type="button" aria-label={`Editar ${area.name}`} onClick={() => setMode("editing")} className={iconButton}>
              <Pencil size={16} />
            </button>
            <button type="button" aria-label={`Eliminar ${area.name}`} onClick={() => setMode("confirmDelete")} className={iconButton}>
              <Trash2 size={16} />
            </button>
          </>
        )}

        {mode === "editing" && (
          <>
            <button
              type="button"
              aria-label="Guardar"
              onClick={() => run(() => editArea(area.id, newName.trim()))}
              disabled={saving || !newName.trim() || newName.trim() === area.name}
              className={iconButton}
            >
              <Check size={16} />
            </button>
            <button type="button" aria-label="Cancelar" onClick={() => resetTo("view")} disabled={saving} className={iconButton}>
              <X size={16} />
            </button>
          </>
        )}

        {mode === "confirmDelete" && (
          <>
            <span className="shrink-0 text-xs text-soma-gray">¿Eliminar?</span>
            <button
              type="button"
              onClick={() => run(() => deleteArea(area.id))}
              disabled={saving}
              className="shrink-0 px-2 py-1 rounded-md text-xs font-semibold text-white bg-soma-red disabled:opacity-50"
            >
              {saving ? "Eliminando..." : "Sí"}
            </button>
            <button type="button" onClick={() => resetTo("view")} disabled={saving} className="shrink-0 px-2 py-1 rounded-md text-xs font-semibold text-soma-brown">
              No
            </button>
          </>
        )}
      </div>

      {status === "error" && (
        <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
      )}
    </li>
  );
}

/**
 * Lista de todas las áreas, cada una con opciones de editar y eliminar.
 *
 * @param areas - las áreas a mostrar
 * @param onChanged - se llama después de editar o borrar un área
 * @returns la lista, o un aviso si no hay áreas
 * @example
 * <AreaListComponent areas={areas} onChanged={loadAreas} />
 */
export function AreaListComponent({ areas, onChanged }: { areas: Area[]; onChanged: () => void }) {
  if (areas.length === 0) {
    return <p className="text-xs text-soma-gray">Todavía no hay áreas.</p>;
  }

  return (
    <ul className="space-y-2">
      {areas.map((area) => (
        <AreaItem key={area.id} area={area} onChanged={onChanged} />
      ))}
    </ul>
  );
}
