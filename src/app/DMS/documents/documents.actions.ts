'use server'

import type { PendingDocumentInput } from "@/lib/core/documents/provider/documents.provider";
import { documentsProvider } from "@/lib/core/documents/service/documents.service";
import { storageProvider} from "@/lib/core/storage/service/storage.service";
import { withFileExtension, type SignedUrl } from "@/lib/core/storage/provider/storage.provider";
import { AppError } from "@/lib/errors/base";
import { addRecentDocument } from "@/lib/core/documents/recentDocuments";
import { handleError } from "@/lib/errors/handleError";


export type UploadDocumentResult = 
    | {ok: true; uuid: string; signedUrl: SignedUrl}
    | {ok: false; code: string; message: string};

export type ConfirmedUploadResult = 
    | {ok: true}
    | {ok: false; code: string; message: string}; 

export async function uploadDocument(input: PendingDocumentInput): Promise<UploadDocumentResult> {
    try {
        const {id, key }= await documentsProvider.createPendingDocument(input); 
        const url: SignedUrl = await storageProvider.createUploadUrl({
            key,
            contentType: input.fileType,
            size: input.fileSize,
        });
        return {ok: true, uuid: id, signedUrl: url};
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[uploadDocument] ${err.code} (${err.statusCode}): ${err.detail}`);
            return {ok: false, code: err.code, message: err.genericMessage};
        }
        console.error(`[uploadDocument] error inesperado: `, err);
        return { ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intetna mas tarde'}
    }
}

export async function confirmUploadedDocument(documentId: string): Promise<ConfirmedUploadResult> {
    try {
        await documentsProvider.confirmUpload(documentId);
        return {ok: true};
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[confirmUploadedDocument] ${err.code} (${err.statusCode}): ${err.detail}`);
            return {ok: false, code: err.code, message: err.genericMessage};
        }
        console.error(`[confirmUploadedDocument] error inesperado: `, err);
        return { ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intetna mas tarde'}
    }
}

export type AddDocumentToAreaResult =
    | {ok: true}
    | {ok: false; code: string; message: string};

/**
 * Asigna un área a un documento. Si ya la tenía, también devuelve `ok`.
 *
 * @param documentId - id del documento
 * @param areaId - id del área
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await addDocumentToArea(documentId, areaId)
 */
export async function addDocumentToArea(documentId: string, areaId: string): Promise<AddDocumentToAreaResult> {
    try {
        await documentsProvider.addDocumentToArea(documentId, areaId);
        return {ok: true};
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[addDocumentToArea] ${err.code} (${err.statusCode}): ${err.detail}`);
            return {ok: false, code: err.code, message: err.genericMessage};
        }
        console.error(`[addDocumentToArea] error inesperado: `, err);
        return {ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intenta más tarde.'};
    }
}

export type OpenDocumentResult =
    | {ok: true; url: string}
    | {ok: false; code: string; message: string};

/**
 * Abre un documento ("Ver"):
 * 1. `accessDocument(id, 'view')`: la base valida el permiso de lectura, lee
 *    el documento y registra la vista en la bitácora (ADR-012). Sin permiso
 *    o sin documento, no se firma nada.
 * 2. Firma una URL de R2 de vida corta con `inline`, para que el navegador
 *    lo muestre (PDF, imágenes) en lugar de descargarlo. El nombre lleva la
 *    extensión según su MIME, por si el usuario lo guarda desde el visor.
 * 3. Lo agrega a "Documentos recientes" (cookie del usuario). Escribir una
 *    cookie desde una Server Action también limpia el Router Cache, así que
 *    `/DMS` muestra la lista nueva en la siguiente visita.
 *
 * @param documentId - id del documento
 * @returns la URL firmada o el error para mostrar en la UI
 * @example
 * const result = await openDocument(document.id)
 * if (result.ok) window.open(result.url)
 */
export async function openDocument(documentId: string): Promise<OpenDocumentResult> {
    try {
        const { name, filePath, fileType } = await documentsProvider.accessDocument(documentId, 'view');
        const { url } = await storageProvider.createDownloadUrl({
            key: filePath,
            fileName: withFileExtension(name, fileType),
            disposition: 'inline',
        });
        await addRecentDocument(documentId);
        return {ok: true, url};
    } catch (err) {
        return {ok: false, ...handleError('openDocument', err)};
    }
}

export type DownloadDocumentResult =
    | {ok: true; url: string}
    | {ok: false; code: string; message: string};

/**
 * Descarga un documento ("Descargar"). Solo quien tenga permiso de descarga
 * (`can_download_documents()`, hoy solo admin). `accessDocument(id,
 * 'download')` valida el permiso en la base y registra la descarga antes de
 * firmar: aunque alguien llame esta action sin ver el botón, recibe
 * `{ok: false}` y nunca una URL.
 *
 * La URL va con `attachment`, así que el navegador descarga el archivo con
 * el nombre del documento y la extensión de su MIME (ej. `Manual HACCP.pdf`).
 *
 * @param documentId - id del documento
 * @returns la URL firmada o el error para mostrar en la UI
 * @example
 * const result = await downloadDocument(document.id)
 * if (result.ok) window.location.href = result.url
 */
export async function downloadDocument(documentId: string): Promise<DownloadDocumentResult> {
    try {
        const { name, filePath, fileType } = await documentsProvider.accessDocument(documentId, 'download');
        const { url } = await storageProvider.createDownloadUrl({
            key: filePath,
            fileName: withFileExtension(name, fileType),
            disposition: 'attachment',
        });
        return {ok: true, url};
    } catch (err) {
        return {ok: false, ...handleError('downloadDocument', err)};
    }
}