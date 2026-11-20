/**
 * Contrato de las operaciones sobre los registros de documentos (tabla
 * `documents`). Los servicios (ej. `service/documents.service.ts`) implementan
 * esta interfaz contra un proveedor específico. Nada fuera de
 * `/lib/core/documents/` debe conocer al proveedor concreto — solo esta forma.
 *
 * Este módulo maneja filas, no archivos. Firmar URLs de subida o descarga es
 * trabajo de `/lib/core/storage/`. Una subida usa los dos (ADR-010):
 * 1. `documentsProvider.createPendingDocument()` crea la fila pendiente.
 * 2. `storageProvider.createUploadUrl()` firma la subida para esa key.
 * 3. El navegador sube el archivo a R2.
 * 4. `documentsProvider.confirmUpload()` marca la subida como terminada.
 *
 * Los permisos los decide RLS: las operaciones corren con la sesión de quien
 * llama, y solo `is_admin()` puede escribir en `documents` (ADR-008).
 */

import type { SupportedFileTypes } from '@/lib/core/storage/provider/storage.provider';

/**
 * Datos para crear la fila de un documento antes de subir su archivo. El `id` y
 * la key no van aquí: los genera `createPendingDocument`.
 */
export interface PendingDocumentInput {
    /** Nombre visible del documento. También es el nombre de descarga. */
    name: string;
    description?: string;
    /** MIME type del archivo. */
    fileType: SupportedFileTypes;
    /** Tamaño exacto del archivo en bytes. */
    fileSize: number;
}

export interface PendingDocumentResponse {
    id: string;
    key: string;
}
/**
 * Operaciones sobre los registros de documentos.
 */
export interface DocumentsProvider {
    /**
     * Crea la fila de un documento con la subida pendiente (`uploaded_at` en
     * `NULL`). El documento no aparece en listados hasta que se confirme con
     * `confirmUpload`. Genera el `id` en el servidor y la key a partir de él;
     * si el `id` ya existe, reintenta con uno nuevo (máximo 3 intentos).
     * `uploaded_by` se toma de la sesión.
     *
     * @param input - metadatos del documento
     * @returns el `id` de la fila y la key (`filePath`) para firmar la subida
     * @throws {AuthError} `AuthenticationFailure` si no hay sesión válida
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {DocumentError} `CreateFailed` si no se pudo insertar la fila o
     *   los 3 intentos chocaron con un `id` existente
     * @example
     * const { id, filePath } = await documentsProvider.createPendingDocument({
     *   name: "Brand Book v3.0",
     *   fileType: SupportedFileTypes.Pdf,
     *   fileSize: 482113,
     * })
     */
    createPendingDocument(input: PendingDocumentInput): Promise<PendingDocumentResponse>;

    /**
     * Marca como terminada la subida de un documento (`uploaded_at = now()`).
     * Solo actualiza filas que siguen pendientes.
     *
     * @param documentId - id del documento cuya subida terminó
     * @throws {DocumentError} `UploadNotPending` si no existe una subida pendiente
     *   con ese id: ya se confirmó, la limpieza borró la fila, o quien llama no
     *   tiene permiso para modificarla; `ConfirmFailed` si la actualización falló
     * @example
     * await documentsProvider.confirmUpload(id)
     */
    confirmUpload(documentId: string): Promise<void>;

    /**
     * Asigna un área a un documento (fila en `document_areas`). Si el
     * documento ya tenía esa área, no hace nada.
     *
     * @param documentId - id del documento
     * @param areaId - id del área
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {DocumentError} `AssignAreaFailed` si el documento o el área no
     *   existen, o si el insert falló por otra razón
     * @example
     * await documentsProvider.addDocumentToArea(documentId, areaId)
     */
    addDocumentToArea(documentId: string, areaId: string): Promise<void>;

    /**
     * Asigna un documento a una carpeta, lo mueve de una carpeta a otra o lo
     * saca de toda carpeta (`folderId = null`). Las tres son el mismo cambio
     * de `documents.folder_id`. Un documento con soft delete no se puede
     * mover: primero hay que recuperarlo (ADR-011).
     *
     * @param documentId - id del documento
     * @param folderId - id de la carpeta destino, o `null` para dejarlo sin carpeta
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {DocumentError} `MoveToFolderFailed` si la carpeta no existe, si
     *   el documento no existe, está eliminado o quien llama no es admin, o si
     *   la actualización falló por otra razón
     * @example
     * await documentsProvider.moveDocumentToFolder(documentId, folderId)
     */
    moveDocumentToFolder(documentId: string, folderId: string | null): Promise<void>;
}
