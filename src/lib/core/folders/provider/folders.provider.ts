/**
 * Contrato de las operaciones sobre carpetas (tablas `folders` y
 * `folder_areas`). Los servicios (ej. `service/folders.service.ts`)
 * implementan esta interfaz contra un proveedor específico. Nada fuera de
 * `/lib/core/folders/` debe conocer al proveedor concreto — solo esta forma.
 *
 * Las carpetas forman un árbol (`parent_id`, `NULL` = raíz). Un área asignada
 * a una carpeta la heredan sus documentos y los de todas sus subcarpetas
 * (ADR-011). Mover un documento a una carpeta es trabajo de
 * `/lib/core/documents/`.
 *
 * Los permisos los decide RLS: las operaciones corren con la sesión de quien
 * llama, y solo `is_admin()` puede escribir en `folders` y `folder_areas`.
 */

import type { Tables } from '@/lib/core/database.types';

export type Folder = Pick<Tables<'folders'>, 'id' | 'folder_name' | 'parent_id'>;

export type FolderDocument = Pick<
    Tables<'documents'>,
    'id' | 'name' | 'description' | 'file_type' | 'file_size' | 'uploaded_at'
>;

/** Contenido directo de una carpeta: sus subcarpetas y sus documentos. */
export interface FolderElements {
    folders: Folder[];
    documents: FolderDocument[];
}

/**
 * Operaciones sobre carpetas y sus áreas.
 */
export interface FoldersProvider {
    /**
     * Crea una carpeta. `created_by` lo pone Postgres con el usuario de la sesión.
     *
     * @param folderName - nombre de la carpeta; único dentro de su carpeta padre
     * @param parentId - `id` de la carpeta padre, o `null` para crearla en la raíz
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin o
     *   no hay sesión
     * @throws {FolderError} `CreateFailed` si ya existe una carpeta con ese
     *   nombre en el mismo padre, si el padre no existe o si el insert falló
     * @example
     * await foldersProvider.createFolder('Calidad', null)
     */
    createFolder(folderName: string, parentId: string | null): Promise<void>;

    /**
     * Cambia el nombre de una carpeta.
     *
     * @param folderId - `id` de la carpeta
     * @param newFolderName - nombre nuevo; único dentro de su carpeta padre
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `RenameFailed` si el nombre ya existe en el mismo
     *   padre, si la carpeta no existe o quien llama no es admin, o por otro error
     * @example
     * await foldersProvider.renameFolder(folderId, 'Auditorías 2026')
     */
    renameFolder(folderId: string, newFolderName: string): Promise<void>;

    /**
     * Mueve una carpeta (con todo su contenido) dentro de otra o a la raíz.
     *
     * @param folderId - `id` de la carpeta que se mueve
     * @param newParentId - `id` de la carpeta destino, o `null` para la raíz
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `MoveFailed` si el destino es la misma carpeta o una
     *   de sus subcarpetas (ciclo), si el destino ya tiene una carpeta con ese
     *   nombre, si el destino o la carpeta no existen, o por otro error
     * @example
     * await foldersProvider.moveFolder(folderId, null)
     */
    moveFolder(folderId: string, newParentId: string | null): Promise<void>;

    /**
     * Borra una carpeta vacía. Sus filas en `folder_areas` se borran en cascada.
     *
     * @param folderId - `id` de la carpeta
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `DeleteFailed` si la carpeta tiene subcarpetas o
     *   documentos activos, si no existe o quien llama no es admin, o por otro error
     * @example
     * await foldersProvider.deleteFolder(folderId)
     */
    deleteFolder(folderId: string): Promise<void>;

    /**
     * Devuelve el contenido directo de una carpeta: sus subcarpetas y sus
     * documentos. No baja a niveles más profundos.
     *
     * @param folderId - `id` de la carpeta, o `null` para la raíz
     * @returns subcarpetas y documentos de esa carpeta
     * @throws {FolderError} `FetchFailed` si la consulta falló
     * @example
     * const { folders, documents } = await foldersProvider.getFolderElements(null)
     */
    getFolderElements(folderId: string | null): Promise<FolderElements>;

    /**
     * Asigna un área a una carpeta (fila en `folder_areas`). Si la carpeta ya
     * tenía esa área, no hace nada.
     *
     * @param folderId - `id` de la carpeta
     * @param areaId - `id` del área
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {FolderError} `AssignAreaFailed` si la carpeta o el área no
     *   existen, o si el insert falló por otra razón
     * @example
     * await foldersProvider.assignAreaToFolder(folderId, areaId)
     */
    assignAreaToFolder(folderId: string, areaId: string): Promise<void>;

    /**
     * Quita un área de una carpeta (borra la fila en `folder_areas`).
     *
     * @param folderId - `id` de la carpeta
     * @param areaId - `id` del área
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {FolderError} `RemoveAreaFailed` si la carpeta no tenía esa área,
     *   si quien llama no es admin, o por otro error
     * @example
     * await foldersProvider.removeAreaFromFolder(folderId, areaId)
     */
    removeAreaFromFolder(folderId: string, areaId: string): Promise<void>;
}
