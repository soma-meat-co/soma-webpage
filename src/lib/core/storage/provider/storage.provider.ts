/**
 * Contrato de las operaciones de almacenamiento de archivos. Los servicios (ej.
 * `service/storage.service.ts`) implementan esta interfaz contra un proveedor
 * específico (hoy Cloudflare R2). Nada fuera de `/lib/core/storage/` debe
 * conocer al proveedor concreto — solo esta forma.
 *
 * Este módulo no valida permisos. Quien llama (Server Action) debe validar
 * antes: `is_admin()` para subir, y RLS sobre `documents` para descargar.
 * Ningún archivo tiene URL pública permanente; el acceso es siempre por URL
 * firmada de vida corta.
 *
 * Next no borra archivos. Borrar un documento es un soft delete en
 * `documents`; el archivo lo elimina la Edge Function `hard-delete-documents`,
 * que dispara el cron.
 */

/**
 * Datos para firmar una subida. `contentType` y `size` quedan incluidos en la
 * firma: si el navegador sube otro tipo o tamaño, el proveedor rechaza la subida.
 */
export interface UploadUrlInput {
    /** Key del objeto en el bucket. Se genera en el servidor, nunca viene del usuario. */
    key: string;
    /** MIME type del archivo (ej. `application/pdf`). */
    contentType: string;
    /** Tamaño exacto del archivo en bytes. */
    size: number;
}

export enum SupportedFileTypes {
    Pdf  = 'application/pdf',
    Docx = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    Xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    Pptx = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    Png  = 'image/png',
    Jpeg = 'image/jpeg',
}

/**
 * Extensión que lleva la key en R2 según el MIME validado. `satisfies` obliga
 * a que cada valor de `SupportedFileTypes` tenga su extensión: si se agrega un
 * tipo al enum y no aquí, TypeScript marca error.
 */
export const FILE_SUFFIX = {
    [SupportedFileTypes.Pdf]:  '.pdf',
    [SupportedFileTypes.Docx]: '.docx',
    [SupportedFileTypes.Xlsx]: '.xlsx',
    [SupportedFileTypes.Pptx]: '.pptx',
    [SupportedFileTypes.Png]:  '.png',
    [SupportedFileTypes.Jpeg]: '.jpg',
} as const satisfies Record<SupportedFileTypes, `.${string}`>;

export function isSupportedFileType(type: string): type is SupportedFileTypes {
    return (Object.values(SupportedFileTypes) as string[]).includes(type);
}

/**
 * Nombre de archivo con la extensión que corresponde a su MIME type, para
 * que al verlo o descargarlo el sistema operativo sepa con qué abrirlo. Si el
 * nombre ya termina en esa extensión (sin importar mayúsculas) no la repite.
 * Un MIME que no está en `SupportedFileTypes` deja el nombre igual.
 *
 * @param name - nombre del documento (`documents.name`)
 * @param fileType - MIME type del documento (`documents.file_type`)
 * @returns el nombre con extensión
 * @example
 * withFileExtension("Brand Book v3.0", "application/pdf")     // "Brand Book v3.0.pdf"
 * withFileExtension("Manual HACCP.PDF", "application/pdf")    // "Manual HACCP.PDF"
 */
export function withFileExtension(name: string, fileType: string): string {
    if (!isSupportedFileType(fileType)) return name;

    const suffix = FILE_SUFFIX[fileType];
    return name.toLowerCase().endsWith(suffix) ? name : `${name}${suffix}`;
}
export interface DocumentPayload {
    name: string;
    description: string;
    filePath: string;
    fileType: SupportedFileTypes;
    fileSize: number;
}

/**
 * Datos para firmar una descarga.
 */
export interface DownloadUrlInput {
    /** Key del objeto en el bucket (`documents.file_path`). */
    key: string;
    /** Nombre con el que se descarga el archivo (`documents.name`). */
    fileName: string;
    /**
     * `inline` para que el navegador lo muestre (PDF, imágenes) o `attachment`
     * para forzar la descarga. Por defecto `attachment`. Un tipo que el
     * navegador no sabe mostrar (ej. `.docx`) se descarga aunque sea `inline`.
     */
    disposition?: 'inline' | 'attachment';
}

/**
 * URL firmada y el momento en que deja de ser válida.
 */
export interface SignedUrl {
    url: string;
    expiresAt: Date;
}

/**
 * Operaciones sobre archivos en el object storage.
 */
export interface StorageProvider {
    /**
     * Firma una URL para que el navegador suba un archivo directo al bucket
     * con `PUT`. No sube nada por sí misma.
     *
     * @param input - key del objeto, MIME type y tamaño en bytes
     * @returns la URL de subida y su expiración
     * @throws {StorageError} si no se pudo firmar la URL
     * @example
     * const { url } = await storageProvider.createUploadUrl({
     *   key: "documents/3f1c...",
     *   contentType: "application/pdf",
     *   size: 482113,
     * })
     */
    createUploadUrl(input: UploadUrlInput): Promise<SignedUrl>;

    /**
     * Firma una URL de descarga de vida corta. El archivo se descarga con
     * `fileName` como nombre, no con la key.
     *
     * @param input - key del objeto y nombre de descarga
     * @returns la URL de descarga y su expiración
     * @throws {StorageError} si no se pudo firmar la URL
     * @example
     * const { url } = await storageProvider.createDownloadUrl({
     *   key: document.file_path,
     *   fileName: document.name,
     * })
     */
    createDownloadUrl(input: DownloadUrlInput): Promise<SignedUrl>;
    createDocumentKey(uuid: string, fileType: SupportedFileTypes): string; 
}
