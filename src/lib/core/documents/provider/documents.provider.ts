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
import type { FolderDocument } from '@/lib/core/folders/provider/folders.provider';

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
 * Lo necesario para firmar la URL de un documento ya subido.
 */
export interface DocumentFile {
    /** Nombre visible; se usa como nombre del archivo al verlo o descargarlo. */
    name: string;
    /** Key del objeto en R2. */
    filePath: string;
    /** MIME type; sirve para agregar la extensión al nombre del archivo. */
    fileType: string;
}

/**
 * Tipo de acceso que se registra en la bitácora (`document_access_log`).
 * `view` = "Ver" (inline); `download` = "Descargar" (attachment).
 */
export type DocumentAccessType = 'view' | 'download';

/** Datos de "Editar documento". Reemplazan nombre, carpeta y áreas propias. */
export interface UpdateDocumentInput {
    name: string;
    /** `id` de la carpeta destino, o `null` para la raíz. */
    folderId: string | null;
    /**
     * Lista completa de áreas propias: las que no vengan se quitan. Las
     * heredadas de la carpeta no cuentan aquí.
     */
    areaIds: string[];
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

    /**
     * Lee los documentos de una lista de ids, en el mismo orden de la lista,
     * con sus `tags` (áreas propias y heredadas). Los ids que no existen,
     * están eliminados, no terminaron de subirse o el usuario no puede leer
     * no aparecen en el resultado. Una lista vacía no consulta nada.
     *
     * @param documentIds - ids de los documentos, en el orden deseado
     * @returns los documentos encontrados, en el orden de `documentIds`
     * @throws {AccessError} `AuthorizationFailure` si quien llama no tiene
     *   acceso a documentos
     * @throws {DocumentError} `FetchFailed` si la consulta falló
     * @example
     * const recent = await documentsProvider.getDocumentsByIds(ids)
     */
    getDocumentsByIds(documentIds: string[]): Promise<FolderDocument[]>;

    /**
     * Autoriza un acceso a un documento, lo registra en la bitácora y regresa
     * lo necesario para firmar su URL. Todo pasa en la base en una sola
     * operación (ADR-012):
     * - `view` exige `can_access_documents()`; `download` exige
     *   `can_download_documents()` (hoy solo admin). Es el candado real de
     *   "Descargar": esconder el botón en la UI es solo presentación.
     * - Si el registro en la bitácora falla, falla todo: no hay URL sin registro.
     *
     * Solo considera documentos sin soft delete y con la subida confirmada.
     *
     * @param documentId - id del documento
     * @param accessType - `view` para "Ver", `download` para "Descargar"
     * @returns nombre, key y MIME type del archivo
     * @throws {AccessError} `AuthorizationFailure` si quien llama no tiene
     *   permiso para ese tipo de acceso
     * @throws {DocumentError} `NotFound` si no existe, está eliminado, no
     *   terminó de subirse o el id no es válido; `FetchFailed` si la llamada
     *   falló (incluye que no se pudo registrar el acceso)
     * @example
     * const file = await documentsProvider.accessDocument(documentId, 'view')
     */
    accessDocument(documentId: string, accessType: DocumentAccessType): Promise<DocumentFile>;

    /**
     * Devuelve los ids de las áreas propias de un documento (sin las
     * heredadas de su carpeta).
     *
     * @param documentId - id del documento
     * @returns ids de sus áreas propias; vacío si no tiene
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {DocumentError} `FetchFailed` si la consulta falló
     * @example
     * const areaIds = await documentsProvider.getDocumentAreaIds(documentId)
     */
    getDocumentAreaIds(documentId: string): Promise<string[]>;

    /**
     * Cambia nombre, carpeta y áreas propias de un documento en una sola
     * transacción (RPC `update_document`): si algo falla, no se guarda nada.
     * Un documento con soft delete no se edita.
     *
     * @param documentId - id del documento
     * @param input - nombre, carpeta destino y lista completa de áreas propias
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {DocumentError} `UpdateFailed` si el documento no existe o está
     *   eliminado, si la carpeta o un área no existen, o por otro error
     * @example
     * await documentsProvider.updateDocument(documentId, { name: 'Manual HACCP', folderId, areaIds: [] })
     */
    updateDocument(documentId: string, input: UpdateDocumentInput): Promise<void>;
}
