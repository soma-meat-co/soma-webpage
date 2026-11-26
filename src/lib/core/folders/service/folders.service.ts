import 'server-only';

import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { FolderElements, FolderSummary, FoldersProvider, UpdateFolderInput } from '../provider/folders.provider';

// INDEX: Error imports
import { AccessError, AccessErrorCode } from '@/lib/errors/access';
import { FolderError, FolderErrorCode } from '@/lib/errors/folders';

/**
 * Código de Postgres para permisos insuficientes: una política de RLS rechazó
 * un INSERT, o al rol le falta el GRANT sobre la tabla.
 */
const INSUFFICIENT_PRIVILEGE = '42501';

/** Código de Postgres cuando se repite una llave única (`parent_id` + `folder_name`, o `folder_areas`). */
const UNIQUE_VIOLATION = '23505';

/**
 * Código de Postgres cuando una llave foránea falla: el padre, la carpeta o el
 * área no existen, o se borra una carpeta que todavía tiene hijas o documentos
 * (`ON DELETE RESTRICT`).
 */
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Código de Postgres cuando falla un CHECK. En `folders` lo lanzan
 * `folders_no_self_parent` y el trigger `folders_prevent_cycle` (ADR-011).
 */
const CHECK_VIOLATION = '23514';

/** Código de Postgres `no_data_found`. Lo lanza `update_folder` si la carpeta no existe. */
const NO_DATA_FOUND = 'P0002';

/**
 * Error para un `42501`. El detalle nombra la operación para que en los logs
 * se vea de inmediato que fue un problema de permisos.
 *
 * @param action - nombre de la operación
 * @param message - `error.message` de Postgres
 * @returns el `AccessError` listo para lanzar
 * @example
 * if (error.code === INSUFFICIENT_PRIVILEGE) throw insufficientPrivilege('createFolder', error.message)
 */
function insufficientPrivilege(action: string, message: string): AccessError {
    return new AccessError(
        AccessErrorCode.AuthorizationFailure,
        `${action}: permisos insuficientes en "folders" (42501). ¿Se llamó sin sesión de admin? ${message}`,
        'No cuentas con los permisos necesarios para esta acción.',
        403,
    );
}

/**
 * Implementación de {@link FoldersProvider} sobre Supabase. Los permisos los
 * decide RLS (`is_admin()` en todas las escrituras de `folders` y `folder_areas`).
 */
class SupabaseFoldersService implements FoldersProvider {
    /**
     * Inserta una carpeta. `created_by` lo pone Postgres (`DEFAULT auth.uid()`).
     *
     * @param folderName - nombre de la carpeta; único dentro de su carpeta padre
     * @param parentId - `id` de la carpeta padre, o `null` para la raíz
     * @throws {AccessError} `AuthorizationFailure` si RLS rechaza el insert
     *   (no es admin o no hay sesión)
     * @throws {FolderError} `CreateFailed` si el nombre ya existe en el mismo
     *   padre (`23505`), si el padre no existe (`23503`) o por otro error
     * @example
     * await foldersProvider.createFolder('Calidad', null)
     */
    async createFolder(folderName: string, parentId: string | null): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from('folders')
            .insert({ folder_name: folderName, parent_id: parentId });

        if (!error) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('createFolder', error.message);
        }
        if (error.code === UNIQUE_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.CreateFailed,
                `Nombre de carpeta duplicado en el padre ${parentId}: "${folderName}"`,
                'Ya existe una carpeta con ese nombre en esta ubicación.',
                409,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.CreateFailed,
                `createFolder: no existe la carpeta padre ${parentId}: ${error.message}`,
                'No se encontró la carpeta destino.',
                404,
            );
        }
        throw new FolderError(
            FolderErrorCode.CreateFailed,
            `No se pudo crear la carpeta "${folderName}": ${error.message}`,
            'Ocurrió un error inesperado. Intenta más tarde.',
            500,
        );
    }

    /**
     * Cambia el nombre de una carpeta. En un UPDATE, RLS no da error: si el
     * usuario no es admin la fila se filtra y se actualizan 0 filas. Por eso se
     * pide la fila de vuelta (`.select('id')`) y 0 filas cuenta como fallo.
     *
     * @param folderId - `id` de la carpeta
     * @param newFolderName - nombre nuevo; único dentro de su carpeta padre
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `RenameFailed` si el nombre ya existe en el mismo
     *   padre, si no se actualizó ninguna fila (no existe o RLS la filtró) o
     *   por otro error
     * @example
     * await foldersProvider.renameFolder(folderId, 'Auditorías 2026')
     */
    async renameFolder(folderId: string, newFolderName: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folders')
            .update({ folder_name: newFolderName })
            .eq('id', folderId)
            .select('id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('renameFolder', error.message);
            }
            if (error.code === UNIQUE_VIOLATION) {
                throw new FolderError(
                    FolderErrorCode.RenameFailed,
                    `Nombre de carpeta duplicado al renombrar ${folderId}: "${newFolderName}"`,
                    'Ya existe una carpeta con ese nombre en esta ubicación.',
                    409,
                );
            }
            throw new FolderError(
                FolderErrorCode.RenameFailed,
                `No se pudo renombrar la carpeta ${folderId}: ${error.message}`,
                'Ocurrió un error inesperado. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new FolderError(
                FolderErrorCode.RenameFailed,
                `UPDATE de carpeta ${folderId} afectó 0 filas: no existe o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró la carpeta o no tienes permisos para editarla.',
                404,
            );
        }
    }

    /**
     * Cambia el `parent_id` de una carpeta. El trigger `folders_prevent_cycle`
     * y el CHECK `folders_no_self_parent` rechazan mover una carpeta dentro de
     * sí misma o de una de sus subcarpetas (`23514`). Igual que en
     * `renameFolder`, 0 filas actualizadas cuenta como fallo.
     *
     * @param folderId - `id` de la carpeta que se mueve
     * @param newParentId - `id` de la carpeta destino, o `null` para la raíz
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `MoveFailed` si se formaría un ciclo (`23514`), si
     *   el destino ya tiene una carpeta con ese nombre (`23505`), si el destino
     *   no existe (`23503`), si no se actualizó ninguna fila o por otro error
     * @example
     * await foldersProvider.moveFolder(folderId, null)
     */
    async moveFolder(folderId: string, newParentId: string | null): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folders')
            .update({ parent_id: newParentId })
            .eq('id', folderId)
            .select('id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('moveFolder', error.message);
            }
            if (error.code === CHECK_VIOLATION) {
                throw new FolderError(
                    FolderErrorCode.MoveFailed,
                    `moveFolder: mover ${folderId} dentro de ${newParentId} formaría un ciclo: ${error.message}`,
                    'No puedes mover una carpeta dentro de sí misma o de una de sus subcarpetas.',
                    409,
                );
            }
            if (error.code === UNIQUE_VIOLATION) {
                throw new FolderError(
                    FolderErrorCode.MoveFailed,
                    `moveFolder: el destino ${newParentId} ya tiene una carpeta con el nombre de ${folderId}`,
                    'Ya existe una carpeta con ese nombre en el destino.',
                    409,
                );
            }
            if (error.code === FOREIGN_KEY_VIOLATION) {
                throw new FolderError(
                    FolderErrorCode.MoveFailed,
                    `moveFolder: no existe la carpeta destino ${newParentId}: ${error.message}`,
                    'No se encontró la carpeta destino.',
                    404,
                );
            }
            throw new FolderError(
                FolderErrorCode.MoveFailed,
                `No se pudo mover la carpeta ${folderId}: ${error.message}`,
                'Ocurrió un error inesperado. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new FolderError(
                FolderErrorCode.MoveFailed,
                `UPDATE de carpeta ${folderId} afectó 0 filas: no existe o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró la carpeta o no tienes permisos para moverla.',
                404,
            );
        }
    }

    /**
     * Borra una carpeta. `ON DELETE RESTRICT` en `folders.parent_id` y
     * `documents.folder_id` impide borrarla si tiene subcarpetas o documentos
     * activos (`23503`). Los documentos con soft delete ya no cuentan, porque
     * salen de la carpeta al borrarse (ADR-011). Igual que en `renameFolder`,
     * 0 filas borradas cuenta como fallo.
     *
     * @param folderId - `id` de la carpeta
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `DeleteFailed` si la carpeta no está vacía
     *   (`23503`), si no se borró ninguna fila (no existe o RLS la filtró) o
     *   por otro error
     * @example
     * await foldersProvider.deleteFolder(folderId)
     */
    async deleteFolder(folderId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folders')
            .delete()
            .eq('id', folderId)
            .select('id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('deleteFolder', error.message);
            }
            if (error.code === FOREIGN_KEY_VIOLATION) {
                throw new FolderError(
                    FolderErrorCode.DeleteFailed,
                    `deleteFolder: la carpeta ${folderId} tiene subcarpetas o documentos: ${error.message}`,
                    'La carpeta no está vacía. Mueve o elimina su contenido primero.',
                    409,
                );
            }
            throw new FolderError(
                FolderErrorCode.DeleteFailed,
                `No se pudo borrar la carpeta ${folderId}: ${error.message}`,
                'Ocurrió un error inesperado. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new FolderError(
                FolderErrorCode.DeleteFailed,
                `DELETE de carpeta ${folderId} afectó 0 filas: no existe o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró la carpeta o no tienes permisos para borrarla.',
                404,
            );
        }
    }

    /**
     * Llama al RPC `get_folder_documents`, que hace ambas consultas en Postgres
     * y decide el acceso con `can_access_documents()`. Así, cuando se restrinja
     * la lectura, el cambio vive en SQL y no aquí. El RPC ya excluye documentos
     * con soft delete o con la subida pendiente.
     *
     * supabase-js no lanza excepciones: los errores llegan en `error`, por eso
     * no hay `try/catch`.
     *
     * @param folderId - `id` de la carpeta, o `null` para la raíz
     * @returns subcarpetas y documentos directos de esa carpeta, ordenados por nombre
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     *   (sin sesión o `can_access_documents()` lo negó)
     * @throws {FolderError} `FetchFailed` si el RPC falló por otra razón o no
     *   devolvió datos
     * @example
     * const { folders, documents } = await foldersProvider.getFolderElements(null)
     */
    async getFolderElements(folderId: string | null): Promise<FolderElements> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.rpc('get_folder_documents', {
            p_folder_id: folderId,
        });

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('getFolderElements', error.message);
            }
            throw new FolderError(
                FolderErrorCode.FetchFailed,
                `No se pudo leer el contenido de la carpeta ${folderId ?? 'raíz'}: ${error.message}`,
                'No se pudo cargar la carpeta. Intenta más tarde.',
                500,
            );
        }

        if (!data) {
            throw new FolderError(
                FolderErrorCode.FetchFailed,
                `get_folder_documents(${folderId ?? 'raíz'}) no devolvió datos.`,
                'No se pudo cargar la carpeta. Intenta más tarde.',
                500,
            );
        }

        // El RPC devuelve `jsonb`, que los tipos generados ven como `Json`.
        // La forma { folders, documents } la garantiza la función en SQL.
        return data as unknown as FolderElements;
    }

    /**
     * Inserta la fila en `folder_areas`. Si la pareja ya existe (`23505`), la
     * carpeta ya tenía el área y se trata como éxito.
     *
     * @param folderId - `id` de la carpeta
     * @param areaId - `id` del área
     * @throws {AccessError} `AuthorizationFailure` si RLS rechaza el insert
     * @tthrows {FolderError} `AssignAreaFailed` si la carpeta o el área no
     *   existen (`23503`) o si el insert falló por otra razón
     * @example
     * await foldersProvider.assignAreaToFolder(folderId, areaId)
     */
    async assignAreaToFolder(folderId: string, areaId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase
            .from('folder_areas')
            .insert({ folder_id: folderId, area_id: areaId });

        if (!error || error.code === UNIQUE_VIOLATION) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('assignAreaToFolder', error.message);
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.AssignAreaFailed,
                `assignAreaToFolder: no existe la carpeta ${folderId} o el área ${areaId}: ${error.message}`,
                'No se encontró la carpeta o el área.',
                404,
            );
        }
        throw new FolderError(
            FolderErrorCode.AssignAreaFailed,
            `No se pudo asignar el área ${areaId} a la carpeta ${folderId}: ${error.message}`,
            'No se pudo asignar el área. Intenta más tarde.',
            500,
        );
    }

    /**
     * Borra la fila de `folder_areas`. Igual que en `deleteFolder`, RLS no da
     * error en un DELETE: 0 filas borradas cuenta como fallo.
     *
     * @param folderId - `id` de la carpeta
     * @param areaId - `id` del área
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `RemoveAreaFailed` si no se borró ninguna fila (la
     *   carpeta no tenía esa área o RLS la filtró) o por otro error
     * @example
     * await foldersProvider.removeAreaFromFolder(folderId, areaId)
     */
    async removeAreaFromFolder(folderId: string, areaId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folder_areas')
            .delete()
            .eq('folder_id', folderId)
            .eq('area_id', areaId)
            .select('folder_id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('removeAreaFromFolder', error.message);
            }
            throw new FolderError(
                FolderErrorCode.RemoveAreaFailed,
                `No se pudo quitar el área ${areaId} de la carpeta ${folderId}: ${error.message}`,
                'No se pudo quitar el área. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new FolderError(
                FolderErrorCode.RemoveAreaFailed,
                `DELETE de folder_areas (${folderId}, ${areaId}) afectó 0 filas: no existía o RLS la filtró (¿usuario sin admin?).`,
                'La carpeta no tenía esa área o no tienes permisos para quitarla.',
                404,
            );
        }
    }

    /**
     * Lee `id`, `folder_name` y `parent_id` de todas las carpetas, ordenadas
     * por nombre. RLS (`folders_select`) decide qué filas se ven.
     *
     * @returns todas las carpetas visibles
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `FetchFailed` si la consulta falló
     * @example
     * const folders = await foldersProvider.listAllFolders()
     */
    async listAllFolders(): Promise<FolderSummary[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folders')
            .select('id, folder_name, parent_id')
            .order('folder_name');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('listAllFolders', error.message);
            }
            throw new FolderError(
                FolderErrorCode.FetchFailed,
                `No se pudieron listar las carpetas: ${error.message}`,
                'No se pudieron cargar las carpetas. Intenta más tarde.',
                500,
            );
        }

        return data;
    }

    /**
     * Lee los `area_id` de `folder_areas` para una carpeta.
     *
     * @param folderId - `id` de la carpeta
     * @returns ids de sus áreas propias
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `FetchFailed` si la consulta falló
     * @example
     * const areaIds = await foldersProvider.getFolderAreaIds(folderId)
     */
    async getFolderAreaIds(folderId: string): Promise<string[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('folder_areas')
            .select('area_id')
            .eq('folder_id', folderId);

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('getFolderAreaIds', error.message);
            }
            throw new FolderError(
                FolderErrorCode.FetchFailed,
                `No se pudieron leer las áreas de la carpeta ${folderId}: ${error.message}`,
                'No se pudieron cargar las áreas de la carpeta. Intenta más tarde.',
                500,
            );
        }

        return data.map((row) => row.area_id);
    }

    /**
     * Llama al RPC `update_folder`, que en una transacción cambia nombre,
     * padre y áreas propias. Traduce los códigos de Postgres a mensajes para
     * el usuario.
     *
     * @param folderId - `id` de la carpeta
     * @param input - nombre, carpeta padre y lista completa de áreas propias
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {FolderError} `UpdateFailed` si la carpeta no existe (`P0002`),
     *   si el nombre se repite en el destino (`23505`), si se formaría un
     *   ciclo (`23514`), si el destino o un área no existen (`23503`), o por
     *   otro error
     * @example
     * await foldersProvider.updateFolder(folderId, { folderName: 'Calidad', parentId: null, areaIds: [] })
     */
    async updateFolder(folderId: string, input: UpdateFolderInput): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.rpc('update_folder', {
            p_folder_id: folderId,
            p_folder_name: input.folderName,
            p_parent_id: input.parentId,
            p_area_ids: input.areaIds,
        });

        if (!error) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('updateFolder', error.message);
        }
        if (error.code === NO_DATA_FOUND) {
            throw new FolderError(
                FolderErrorCode.UpdateFailed,
                `updateFolder: no existe la carpeta ${folderId}: ${error.message}`,
                'No se encontró la carpeta.',
                404,
            );
        }
        if (error.code === UNIQUE_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.UpdateFailed,
                `updateFolder: nombre duplicado "${input.folderName}" en el padre ${input.parentId}`,
                'Ya existe una carpeta con ese nombre en esa ubicación.',
                409,
            );
        }
        if (error.code === CHECK_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.UpdateFailed,
                `updateFolder: mover ${folderId} dentro de ${input.parentId} formaría un ciclo: ${error.message}`,
                'No puedes mover una carpeta dentro de sí misma o de una de sus subcarpetas.',
                409,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new FolderError(
                FolderErrorCode.UpdateFailed,
                `updateFolder: no existe el destino ${input.parentId} o un área de [${input.areaIds.join(', ')}]: ${error.message}`,
                'No se encontró la carpeta destino o alguna de las áreas.',
                404,
            );
        }
        throw new FolderError(
            FolderErrorCode.UpdateFailed,
            `No se pudo editar la carpeta ${folderId}: ${error.message}`,
            'No se pudo guardar la carpeta. Intenta más tarde.',
            500,
        );
    }
}

export const foldersProvider: FoldersProvider = new SupabaseFoldersService();
