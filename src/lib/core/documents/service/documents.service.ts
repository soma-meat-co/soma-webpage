import 'server-only';

import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { TablesInsert } from '@/lib/core/database.types';
import { storageProvider } from '@/lib/core/storage/service/storage.service';
import type { DocumentsProvider, PendingDocumentInput, PendingDocumentResponse } from '../provider/documents.provider';

// INDEX: Error imports
import { AccessError, AccessErrorCode } from '@/lib/errors/access';
import { AuthError, AuthErrorCode } from '@/lib/errors/auth';
import { DocumentError, DocumentErrorCode } from '@/lib/errors/documents';
import { PendingReactPromise } from 'react';

/** Código de Postgres cuando una política de RLS rechaza la escritura. */
const RLS_VIOLATION = '42501';

/** Código de Postgres cuando un insert choca con una llave única (aquí, el `id`). */
const UNIQUE_VIOLATION = '23505';

/** Código de Postgres cuando una llave foránea apunta a una fila que no existe. */
const FOREIGN_KEY_VIOLATION = '23503';

/** Intentos de insert antes de rendirse si el `id` generado ya existe. */
const MAX_INSERT_ATTEMPTS = 3;

class SupabaseDocumentsService implements DocumentsProvider {
    /**
     * Inserta la fila pendiente en `documents` con el cliente de sesión, así
     * que RLS (`is_admin()`) decide si se permite. Genera el `id` con
     * `crypto.randomUUID()` y la key con `storageProvider.createDocumentKey`.
     * Si el insert choca con un `id` existente (`23505`), genera otro y
     * reintenta, hasta `MAX_INSERT_ATTEMPTS` veces. `uploaded_by` sale de la
     * sesión, no del input.
     *
     * @param input - metadatos del documento
     * @returns el `id` insertado y su key
     * @throws {AuthError} `AuthenticationFailure` si no hay sesión válida
     * @throws {AccessError} `AuthorizationFailure` si RLS rechaza el insert
     * @throws {DocumentError} `CreateFailed` si el insert falló por otra razón
     *   o se agotaron los intentos por colisión de `id`
     * @example
     * const { id, filePath } = await documentsProvider.createPendingDocument({ name, fileType, fileSize })
     */
    async createPendingDocument(input: PendingDocumentInput): Promise<PendingDocumentResponse> {
        const supabase = await createSupabaseServerClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new AuthError(
                AuthErrorCode.AuthenticationFailure,
                'createPendingDocument sin sesión.',
                'Inicia sesión para continuar.',
                401,
            );
        }

        const { data: canUpload, error: accessError } = await supabase.rpc('has_full_document_access');

        if (accessError) {
            throw new AccessError(
                AccessErrorCode.RoleCheckFailed,
                `No se pudo validar el permiso de subida de ${user.id}: ${accessError.message}`,
                'No se pudieron validar tus permisos. Intenta más tarde.',
                500,
            );
        }

        if (!canUpload) {
            throw new AccessError(
                AccessErrorCode.AuthorizationFailure,
                `Usuario ${user.id} sin permisos suficientes para subir documentos`,
                'No cuentas con los permisos necesarios para esta acción.',
                403,
            );
        }


        for (let attempt = 1; attempt <= MAX_INSERT_ATTEMPTS; attempt++) {
            const id = crypto.randomUUID();
            const filePath = storageProvider.createDocumentKey(id, input.fileType);

            // `file_type` es TEXT en Postgres, así que aquí es `string`. La restricción
            // a `SupportedFileTypes` la da `PendingDocumentInput.fileType`.
            const row: TablesInsert<'documents'> = {
                id,
                name: input.name,
                description: input.description ?? null,
                file_path: filePath,
                file_type: input.fileType,
                file_size: input.fileSize,
                uploaded_by: user.id,
            };

            const { error } = await supabase.from('documents').insert(row);

            if (!error) {
                return { id, key: filePath };
            }

            // El `id` ya existe: se genera otro en la siguiente vuelta.
            if (error.code === UNIQUE_VIOLATION) {
                continue;
            }

            if (error.code === RLS_VIOLATION) {
                throw new AccessError(
                    AccessErrorCode.AuthorizationFailure,
                    `RLS rechazó el insert en documents: ${error.message}`,
                    'No tienes permisos suficientes para subir documentos.',
                    403,
                );
            }

            throw new DocumentError(
                DocumentErrorCode.CreateFailed,
                `No se pudo insertar el documento ${id}: ${error.message}`,
                'No se pudo registrar el documento. Intenta más tarde.',
                500,
            );
        }

        throw new DocumentError(
            DocumentErrorCode.CreateFailed,
            `${MAX_INSERT_ATTEMPTS} intentos de insert chocaron con un id existente.`,
            'No se pudo registrar el documento. Intenta más tarde.',
            500,
        );
    }

    /**
     * Marca `uploaded_at` en la fila, solo si sigue pendiente. Cuando RLS
     * rechaza un `UPDATE`, Postgres no da error: simplemente no actualiza
     * ninguna fila. Por eso se pide de vuelta el `id` y cero filas se trata
     * como "no hay subida pendiente".
     *
     * @param documentId - id del documento cuya subida terminó
     * @throws {DocumentError} `UploadNotPending` si ninguna fila se actualizó;
     *   `ConfirmFailed` si la actualización falló
     * @example
     * await documentsProvider.confirmUpload(id)
     */
    async confirmUpload(documentId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('documents')
            .update({ uploaded_at: new Date().toISOString() })
            .eq('id', documentId)
            .is('uploaded_at', null)
            .select('id');

        if (error) {
            throw new DocumentError(
                DocumentErrorCode.ConfirmFailed,
                `No se pudo confirmar la subida de ${documentId}: ${error.message}`,
                'No se pudo confirmar la subida. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new DocumentError(
                DocumentErrorCode.UploadNotPending,
                `No hay subida pendiente para ${documentId} (ya confirmada, limpiada o sin permiso).`,
                'La subida ya no es válida. Vuelve a subir el archivo.',
                404,
            );
        }
    }

    /**
     * Inserta la fila en `document_areas` con el cliente de sesión, así que
     * RLS (`is_admin()`) decide si se permite. Si la pareja ya existe
     * (`23505`), el documento ya tenía el área y se trata como éxito.
     *
     * @param documentId - id del documento
     * @param areaId - id del área
     * @throws {AccessError} `AuthorizationFailure` si RLS rechaza el insert
     * @throws {DocumentError} `AssignAreaFailed` si el documento o el área no
     *   existen (`23503`) o si el insert falló por otra razón
     * @example
     * await documentsProvider.addDocumentToArea(documentId, areaId)
     */
    async addDocumentToArea(documentId: string, areaId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from('document_areas')
            .insert({ document_id: documentId, area_id: areaId });

        if (!error || error.code === UNIQUE_VIOLATION) return;

        if (error.code === RLS_VIOLATION) {
            throw new AccessError(
                AccessErrorCode.AuthorizationFailure,
                `addDocumentToArea: RLS rechazó asignar el área ${areaId} al documento ${documentId}: ${error.message}`,
                'No cuentas con los permisos necesarios para esta acción.',
                403,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new DocumentError(
                DocumentErrorCode.AssignAreaFailed,
                `addDocumentToArea: no existe el documento ${documentId} o el área ${areaId}: ${error.message}`,
                'No se encontró el documento o el área.',
                404,
            );
        }
        throw new DocumentError(
            DocumentErrorCode.AssignAreaFailed,
            `No se pudo asignar el área ${areaId} al documento ${documentId}: ${error.message}`,
            'No se pudo asignar el área. Intenta más tarde.',
            500,
        );
    }
}

export const documentsProvider: DocumentsProvider = new SupabaseDocumentsService();
