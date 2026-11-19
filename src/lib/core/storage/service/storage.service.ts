import 'server-only';

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { privateEnv } from '@/lib/privateEnv';
import type { DownloadUrlInput, SignedUrl, StorageProvider, SupportedFileTypes, UploadUrlInput } from '../provider/storage.provider';
import { FILE_SUFFIX } from '../provider/storage.provider';

// INDEX: Error imports
import { StorageError, StorageErrorCode } from '@/lib/errors/storage';

/** Segundos que una URL de subida es válida. */
const UPLOAD_URL_TTL_SECONDS = 5 * 60;

/** Segundos que una URL de descarga es válida. */
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

/**
 * Cliente S3 apuntando a R2. `region: 'auto'` es lo que R2 espera.
 *
 * Los checksums quedan en `WHEN_REQUIRED`: desde la v3.729 el SDK agrega un
 * checksum por defecto a las URLs firmadas de `PUT`, que el navegador no manda
 * y R2 rechaza.
 */
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${privateEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: privateEnv.R2_ACCESS_KEY_ID,
        secretAccessKey: privateEnv.R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
});

/**
 * Calcula el momento en que una URL firmada deja de ser válida.
 *
 * @param ttlSeconds - segundos de vida de la URL
 * @returns la fecha de expiración
 * @example
 * const expiresAt = expiresIn(UPLOAD_URL_TTL_SECONDS)
 */
function expiresIn(ttlSeconds: number): Date {
    return new Date(Date.now() + ttlSeconds * 1000);
}

/**
 * Arma el header `Content-Disposition` para descargar con el nombre original.
 * Usa `filename*` con UTF-8 para que los acentos y la ñ lleguen bien.
 *
 * @param fileName - nombre con el que se descarga el archivo
 * @returns el valor del header
 * @example
 * attachmentDisposition("Brand Book v3.0.pdf")
 * // "attachment; filename*=UTF-8''Brand%20Book%20v3.0.pdf"
 */
function attachmentDisposition(fileName: string): string {
    return `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

/**
 * Extrae un mensaje legible de un error desconocido, para el `detail`.
 *
 * @param error - error atrapado
 * @returns el mensaje del error o su representación en texto
 * @example
 * const detail = errorMessage(error)
 */
function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

class R2StorageService implements StorageProvider {
    /**
     * Firma una URL de `PUT` directo a R2. `Content-Type` y `Content-Length`
     * van firmados: si el navegador manda otro tipo o tamaño, R2 rechaza la subida.
     *
     * @param input - key del objeto, MIME type y tamaño en bytes
     * @returns la URL de subida y su expiración
     * @throws {StorageError} `UploadUrlFailed` si no se pudo firmar la URL
     * @example
     * const { url } = await storageProvider.createUploadUrl({
     *   key: "documents/3f1c...",
     *   contentType: "application/pdf",
     *   size: 482113,
     * })
     */
    async createUploadUrl(input: UploadUrlInput): Promise<SignedUrl> {
        const command = new PutObjectCommand({
            Bucket: privateEnv.R2_BUCKET,
            Key: input.key,
            ContentType: input.contentType,
            ContentLength: input.size,
        });

        try {
            const url = await getSignedUrl(r2Client, command, {
                expiresIn: UPLOAD_URL_TTL_SECONDS,
                signableHeaders: new Set(['content-type', 'content-length']),
            });
            return { url, expiresAt: expiresIn(UPLOAD_URL_TTL_SECONDS) };
        } catch (error) {
            throw new StorageError(
                StorageErrorCode.UploadUrlFailed,
                `No se pudo firmar la subida de ${input.key}: ${errorMessage(error)}`,
                'No se pudo preparar la subida del archivo. Intenta más tarde.',
                500,
            );
        }
    }

    /**
     * Firma una URL de `GET` de vida corta. El archivo se descarga con
     * `fileName` como nombre, no con la key.
     *
     * @param input - key del objeto y nombre de descarga
     * @returns la URL de descarga y su expiración
     * @throws {StorageError} `DownloadUrlFailed` si no se pudo firmar la URL
     * @example
     * const { url } = await storageProvider.createDownloadUrl({
     *   key: document.file_path,
     *   fileName: document.name,
     * })
     */
    async createDownloadUrl(input: DownloadUrlInput): Promise<SignedUrl> {
        const command = new GetObjectCommand({
            Bucket: privateEnv.R2_BUCKET,
            Key: input.key,
            ResponseContentDisposition: attachmentDisposition(input.fileName),
        });

        try {
            const url = await getSignedUrl(r2Client, command, {
                expiresIn: DOWNLOAD_URL_TTL_SECONDS,
            });
            return { url, expiresAt: expiresIn(DOWNLOAD_URL_TTL_SECONDS) };
        } catch (error) {
            throw new StorageError(
                StorageErrorCode.DownloadUrlFailed,
                `No se pudo firmar la descarga de ${input.key}: ${errorMessage(error)}`,
                'No se pudo preparar la descarga del archivo. Intenta más tarde.',
                500,
            );
        }
    }
    createDocumentKey(uuid: string, fileType: SupportedFileTypes ): string {
        return `documents/${uuid + FILE_SUFFIX[fileType]}`;
    }
}

export const storageProvider: StorageProvider = new R2StorageService();
