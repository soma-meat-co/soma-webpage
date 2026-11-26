import 'server-only';

import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { TablesInsert } from '@/lib/core/database.types';
import { storageProvider } from '@/lib/core/storage/service/storage.service';
import type { DocumentAccessType, DocumentFile, DocumentsProvider, PendingDocumentInput, PendingDocumentResponse, UpdateDocumentInput } from '../provider/documents.provider';
import type { FolderDocument } from '@/lib/core/folders/provider/folders.provider';

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

/** Código de Postgres cuando un valor no tiene el formato del tipo (ej. un uuid inválido). */
const INVALID_TEXT_REPRESENTATION = '22P02';

/** Código de Postgres `no_data_found`. Lo lanza `update_document` si el documento no existe. */
const NO_DATA_FOUND = 'P0002';

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

    /**
     * Cambia `folder_id` con el cliente de sesión, así que RLS (`is_admin()`)
     * decide si se permite. Solo actualiza documentos sin soft delete
     * (`deleted_at IS NULL`): un documento eliminado debe quedarse fuera de
     * toda carpeta (ADR-011). Como RLS no da error en un UPDATE, se pide la
     * fila de vuelta y 0 filas cuenta como fallo.
     *
     * @param documentId - id del documento
     * @param folderId - id de la carpeta destino, o `null` para dejarlo sin carpeta
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {DocumentError} `MoveToFolderFailed` si la carpeta no existe
     *   (`23503`), si no se actualizó ninguna fila (no existe, está eliminado
     *   o RLS la filtró) o por otro error
     * @example
     * await documentsProvider.moveDocumentToFolder(documentId, folderId)
     */
    async moveDocumentToFolder(documentId: string, folderId: string | null): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('documents')
            .update({ folder_id: folderId })
            .eq('id', documentId)
            .is('deleted_at', null)
            .select('id');

        if (error) {
            if (error.code === RLS_VIOLATION) {
                throw new AccessError(
                    AccessErrorCode.AuthorizationFailure,
                    `moveDocumentToFolder: permisos insuficientes para mover ${documentId}: ${error.message}`,
                    'No cuentas con los permisos necesarios para esta acción.',
                    403,
                );
            }
            if (error.code === FOREIGN_KEY_VIOLATION) {
                throw new DocumentError(
                    DocumentErrorCode.MoveToFolderFailed,
                    `moveDocumentToFolder: no existe la carpeta ${folderId}: ${error.message}`,
                    'No se encontró la carpeta destino.',
                    404,
                );
            }
            throw new DocumentError(
                DocumentErrorCode.MoveToFolderFailed,
                `No se pudo mover el documento ${documentId} a la carpeta ${folderId}: ${error.message}`,
                'No se pudo mover el documento. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new DocumentError(
                DocumentErrorCode.MoveToFolderFailed,
                `UPDATE de documento ${documentId} afectó 0 filas: no existe, está eliminado o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró el documento o no tienes permisos para moverlo.',
                404,
            );
        }
    }

    /**
     * Llama al RPC `get_documents_by_ids` con la sesión de quien llama. El
     * RPC valida `can_access_documents()`, aplica RLS y regresa los
     * documentos en el orden de la lista. Con una lista vacía regresa `[]`
     * sin consultar.
     *
     * @param documentIds - ids de los documentos, en el orden deseado
     * @returns los documentos encontrados, en el orden de `documentIds`
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {DocumentError} `FetchFailed` si el RPC falló o no regresó datos
     * @example
     * const recent = await documentsProvider.getDocumentsByIds(ids)
     */
    async getDocumentsByIds(documentIds: string[]): Promise<FolderDocument[]> {
        if (documentIds.length === 0) return [];

        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.rpc('get_documents_by_ids', {
            p_document_ids: documentIds,
        });

        if (error) {
            if (error.code === RLS_VIOLATION) {
                throw new AccessError(
                    AccessErrorCode.AuthorizationFailure,
                    `getDocumentsByIds: sin acceso a documentos: ${error.message}`,
                    'No cuentas con los permisos necesarios para esta acción.',
                    403,
                );
            }
            throw new DocumentError(
                DocumentErrorCode.FetchFailed,
                `No se pudieron leer los documentos [${documentIds.join(', ')}]: ${error.message}`,
                'No se pudieron cargar los documentos. Intenta más tarde.',
                500,
            );
        }

        if (!data) {
            throw new DocumentError(
                DocumentErrorCode.FetchFailed,
                'get_documents_by_ids no devolvió datos.',
                'No se pudieron cargar los documentos. Intenta más tarde.',
                500,
            );
        }

        return data as unknown as FolderDocument[];
    }

    /**
     * Llama al RPC `access_document`, que en una sola transacción valida el
     * permiso del tipo de acceso (si no, `42501`), lee el documento y lo
     * registra en `document_access_log`. 0 filas o un id con formato
     * inválido (`22P02`) cuentan como no encontrado; en ese caso no se
     * registró nada.
     *
     * @param documentId - id del documento
     * @param accessType - `view` para "Ver", `download` para "Descargar"
     * @returns nombre, key y MIME type del archivo
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {DocumentError} `NotFound` si no hay documento con ese id;
     *   `FetchFailed` si el RPC falló por otra razón (incluye que no se pudo
     *   registrar el acceso)
     * @example
     * const file = await documentsProvider.accessDocument(documentId, 'download')
     */
    async accessDocument(documentId: string, accessType: DocumentAccessType): Promise<DocumentFile> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.rpc('access_document', {
            p_document_id: documentId,
            p_access_type: accessType,
        });

        if (error && error.code === RLS_VIOLATION) {
            throw new AccessError(
                AccessErrorCode.AuthorizationFailure,
                `accessDocument: sin permiso de ${accessType} para ${documentId}: ${error.message}`,
                accessType === 'download'
                    ? 'No cuentas con los permisos necesarios para descargar documentos.'
                    : 'No cuentas con los permisos necesarios para ver documentos.',
                403,
            );
        }

        if (error && error.code !== INVALID_TEXT_REPRESENTATION) {
            throw new DocumentError(
                DocumentErrorCode.FetchFailed,
                `access_document(${documentId}, ${accessType}) falló: ${error.message}`,
                'No se pudo abrir el documento. Intenta más tarde.',
                500,
            );
        }

        const file = data?.[0];
        if (!file) {
            throw new DocumentError(
                DocumentErrorCode.NotFound,
                `Documento ${documentId} no encontrado (${accessType}): no existe, está eliminado, no terminó de subirse o el id es inválido.`,
                'No se encontró el documento o no tienes acceso a él.',
                404,
            );
        }

        return { name: file.name, filePath: file.file_path, fileType: file.file_type };
    }

    /**
     * Lee los `area_id` de `document_areas` para un documento.
     *
     * @param documentId - id del documento
     * @returns ids de sus áreas propias
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {DocumentError} `FetchFailed` si la consulta falló
     * @example
     * const areaIds = await documentsProvider.getDocumentAreaIds(documentId)
     */
    async getDocumentAreaIds(documentId: string): Promise<string[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('document_areas')
            .select('area_id')
            .eq('document_id', documentId);

        if (error) {
            if (error.code === RLS_VIOLATION) {
                throw new AccessError(
                    AccessErrorCode.AuthorizationFailure,
                    `getDocumentAreaIds: sin acceso a las áreas de ${documentId}: ${error.message}`,
                    'No cuentas con los permisos necesarios para esta acción.',
                    403,
                );
            }
            throw new DocumentError(
                DocumentErrorCode.FetchFailed,
                `No se pudieron leer las áreas del documento ${documentId}: ${error.message}`,
                'No se pudieron cargar las áreas del documento. Intenta más tarde.',
                500,
            );
        }

        return data.map((row) => row.area_id);
    }

    /**
     * Llama al RPC `update_document`, que en una transacción cambia nombre,
     * carpeta y áreas propias. Traduce los códigos de Postgres a mensajes
     * para el usuario.
     *
     * @param documentId - id del documento
     * @param input - nombre, carpeta destino y lista completa de áreas propias
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {DocumentError} `UpdateFailed` si el documento no existe o está
     *   eliminado (`P0002`), si la carpeta o un área no existen (`23503`), o
     *   por otro error
     * @example
     * await documentsProvider.updateDocument(documentId, { name: 'Manual HACCP', folderId: null, areaIds: [] })
     */
    async updateDocument(documentId: string, input: UpdateDocumentInput): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.rpc('update_document', {
            p_document_id: documentId,
            p_name: input.name,
            p_folder_id: input.folderId,
            p_area_ids: input.areaIds,
        });

        if (!error) return;

        if (error.code === RLS_VIOLATION) {
            throw new AccessError(
                AccessErrorCode.AuthorizationFailure,
                `updateDocument: permisos insuficientes para editar ${documentId}: ${error.message}`,
                'No cuentas con los permisos necesarios para esta acción.',
                403,
            );
        }
        if (error.code === NO_DATA_FOUND) {
            throw new DocumentError(
                DocumentErrorCode.UpdateFailed,
                `updateDocument: no existe el documento ${documentId} o está eliminado: ${error.message}`,
                'No se encontró el documento.',
                404,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new DocumentError(
                DocumentErrorCode.UpdateFailed,
                `updateDocument: no existe la carpeta ${input.folderId} o un área de [${input.areaIds.join(', ')}]: ${error.message}`,
                'No se encontró la carpeta destino o alguna de las áreas.',
                404,
            );
        }
        throw new DocumentError(
            DocumentErrorCode.UpdateFailed,
            `No se pudo editar el documento ${documentId}: ${error.message}`,
            'No se pudo guardar el documento. Intenta más tarde.',
            500,
        );
    }
}

export const documentsProvider: DocumentsProvider = new SupabaseDocumentsService();
