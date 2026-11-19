"use client"

import { useState } from "react";
import { FileUp } from "lucide-react";
import { SupportedFileTypes, isSupportedFileType } from "@/lib/core/storage/provider/storage.provider";


// Server actions de subir documentos
import { uploadDocument, confirmUploadedDocument } from "./documents.actions";

/** Tipos que el selector de archivos muestra; los mismos que acepta la subida. */
const ACCEPTED_TYPES = Object.values(SupportedFileTypes).join(",");
type UploadStatus = "idle" | "uploading" | "success" | "error"; 

/**
 * Subida de documentos en dos vistas. Sin archivo, muestra la zona de drag and
 * drop (o clic para elegir). Con archivo, la zona desaparece y se muestran los
 * datos del documento. "Subir" crea la fila pendiente (`uploadDocument`), hace
 * el `PUT` a R2 con la URL firmada y confirma (`confirmUploadedDocument`).
 *
 * @returns la zona de subida, o el formulario del documento elegido
 * @example
 * <UploadDocumentsComponent />
 */
export function UploadDocumentsComponent() {
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>();
  const [dragging, setDragging] = useState(false);

  const handleUpload  = async () => {
    if (file === null ){
      setError("No se ha detectado el archivo.");
      setUploadStatus("error");
      return;
    }
    if(!isSupportedFileType(file!.type)) {
      setError("Tipo de archivo no permitido");
      setUploadStatus("error");
      return;
    }
    setError("");
    setUploadStatus("uploading");
    try {
      const data = await uploadDocument({name: name, description: description, fileType: file!.type, fileSize: file.size });
      if (data.ok === false ){
        setError(data.message);
        setUploadStatus("error");
        return;
      }

      // 1. navegador hace put en el data.signedUrl.url
      // `Content-Type` debe ser el mismo que se firmó. `Content-Length` lo pone el
      // navegador a partir del `File`; por eso el body es el `File` directo, sin FormData.
      const response = await fetch(data.signedUrl.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!response.ok) {
        // R2 rechazó la subida (firma inválida, URL expirada, tipo o tamaño distinto).
        // La fila pendiente la borra el cleanup de 24 h (ADR-010).
        console.error(`[handleUpload] R2 respondió ${response.status}`);
        setError("No se pudo subir el archivo. Intenta de nuevo.");
        setUploadStatus("error");
        return;
      }

      // 2. despues de success hacemos confirmUploadedDocument
      const confirmed = await confirmUploadedDocument(data.uuid);
      if (confirmed.ok === false) {
        setError(confirmed.message);
        setUploadStatus("error");
        return;
      }

      setFile(null);
      setName("");
      setDescription(undefined);
      setUploadStatus("success");
    } catch (err) {
      // Las actions no lanzan; esto es red caída, CORS del bucket, o una action
      // que no llegó al servidor.
      console.error("[handleUpload] error inesperado:", err);
      setError("No se pudo conectar. Revisa tu conexión e intenta de nuevo.");
      setUploadStatus("error");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  if (!file) {
    return (
      <div className="space-y-4">
      {uploadStatus === "success" && (
        <p className="text-xs rounded-md px-3 py-2 text-soma-brown bg-soma-brown/10">Documento subido.</p>
      )}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 h-40 rounded-md border-2 border-dashed cursor-pointer text-sm transition-colors ${
          dragging ? "border-soma-red bg-soma-red/5" : "border-[#DAD6CE]"
        }`}
      >
        <FileUp size={24} className="text-soma-gray" />
        <span className="font-semibold text-soma-brown">Subir documento</span>
        <span className="text-soma-gray">Arrastra un archivo o haz clic para elegirlo</span>
        <input
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-soma-gray break-all">{file.name}</p>

      <div>
        <label htmlFor="document-name" className="block text-xs font-semibold mb-1.5 text-soma-brown">
          Nombre del documento
        </label>
        <input
          id="document-name"
          type="text"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Brand Book v3.0"
          className="w-full h-11 px-3 rounded-md border border-[#DAD6CE] bg-white shadow-soma text-sm text-black placeholder:text-soma-gray outline-none transition-colors focus:border-soma-red"
        />
      </div>

      {uploadStatus === "error" && (
        <p className="text-xs rounded-md px-3 py-2 text-soma-red bg-soma-red/10">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!name.trim() || uploadStatus === "uploading"}
        className="w-full h-11 rounded-md shadow-soma font-semibold text-sm text-white bg-soma-red disabled:opacity-50"
      >
        {uploadStatus === "uploading" ? "Subiendo..." : "Subir"}
      </button>
    </div>
  );
}
