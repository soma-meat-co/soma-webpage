"use client"

import { useState } from "react";
import { FileText } from "lucide-react";
import { FILE_SUFFIX, type SupportedFileTypes } from "@/lib/core/storage/provider/storage.provider";
import type { Area } from "@/lib/core/areas/provider/areas.provider";

// Server action de asignar áreas
import { addDocumentToArea } from "./documents.actions";

/** Documento recién subido, con lo necesario para mostrarlo y asignarle áreas. */
export interface UploadedDocument {
  id: string;
  name: string;
  fileType: SupportedFileTypes;
}

type AssignStatus = "idle" | "assigning" | "error";

/**
 * Card de un documento recién subido. Muestra su nombre y su tipo, y permite
 * asignarle áreas desde un dropdown. Cada área asignada aparece como pellet.
 *
 * @param document - el documento subido
 * @param areas - todas las áreas disponibles para el dropdown
 * @param onDone - se llama al terminar, para volver a la zona de subida
 * @returns la card del documento
 * @example
 * <UploadedDocumentCard document={uploaded} areas={areas} onDone={() => setUploaded(null)} />
 */
export function UploadedDocumentCard({
  document,
  areas,
  onDone,
}: {
  document: UploadedDocument;
  areas: Area[];
  onDone: () => void;
}) {
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<AssignStatus>("idle");
  const [error, setError] = useState("");

  const assignedAreas = areas.filter((area) => assignedIds.includes(area.id));
  const availableAreas = areas.filter((area) => !assignedIds.includes(area.id));
  const suffix = FILE_SUFFIX[document.fileType].slice(1).toUpperCase();

  const handleAssign = async (areaId: string) => {
    if (!areaId) return;
    setError("");
    setStatus("assigning");
    try {
      const result = await addDocumentToArea(document.id, areaId);
      if (result.ok === false) {
        setError(result.message);
        setStatus("error");
        return;
      }
      setAssignedIds((ids) => [...ids, areaId]);
      setStatus("idle");
    } catch (err) {
      console.error("[handleAssign] error inesperado:", err);
      setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-md border border-[#DAD6CE] bg-white p-4 shadow-soma">
        <div className="flex items-center gap-3">
          <FileText size={20} className="shrink-0 text-soma-gray" />
          <p className="flex-1 text-sm font-semibold text-soma-brown break-all">{document.name}</p>
          <span className="shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold text-soma-gray bg-soma-gray/10">
            {suffix}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {assignedAreas.length === 0 ? (
            <span className="text-xs text-soma-gray">Sin áreas asignadas.</span>
          ) : (
            assignedAreas.map((area) => (
              <span
                key={area.id}
                className="rounded-full px-3 py-1 text-xs font-semibold text-soma-red bg-soma-red/10"
              >
                {area.name}
              </span>
            ))
          )}
        </div>

        <div>
          <label htmlFor="document-area" className="block text-xs font-semibold mb-1.5 text-soma-brown">
            Agregar a un área
          </label>
          <select
            id="document-area"
            value=""
            onChange={(e) => handleAssign(e.target.value)}
            disabled={status === "assigning" || availableAreas.length === 0}
            className="w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white text-sm text-black outline-none transition-colors focus:border-soma-red disabled:opacity-50"
          >
            <option value="" disabled>
              {availableAreas.length === 0 ? "No hay más áreas" : "Elige un área"}
            </option>
            {availableAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {status === "error" && (
          <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="w-full h-11 rounded-md border border-[#DAD6CE] font-semibold text-sm text-soma-brown"
      >
        Subir otro documento
      </button>
    </div>
  );
}
