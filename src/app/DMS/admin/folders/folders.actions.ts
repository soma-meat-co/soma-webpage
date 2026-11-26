'use server'

import { revalidatePath } from "next/cache";

import { foldersProvider } from "@/lib/core/folders/service/folders.service";
import type { FolderSummary, UpdateFolderInput } from "@/lib/core/folders/provider/folders.provider";
import { documentsProvider } from "@/lib/core/documents/service/documents.service";
import type { UpdateDocumentInput } from "@/lib/core/documents/provider/documents.provider";
import { areasProvider } from "@/lib/core/areas/service/area.service";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { handleError } from "@/lib/errors/handleError";

export type FolderActionResult =
    | { ok: true }
    | { ok: false; code: string; message: string };

/** Qué se está editando en el diálogo "Editar". */
export type EditTarget = { kind: 'folder' | 'document'; id: string };

/** Una carpeta destino en el selector "Ubicación", con su ruta completa. */
export interface FolderDestination {
    /** `id` de la carpeta, o `null` para la raíz ("Documentos"). */
    id: string | null;
    /** Ruta para mostrar, ej. "Documentos / Calidad / Auditorías". */
    label: string;
}

export type EditOptionsResult =
    | { ok: true; destinations: FolderDestination[]; areas: Area[]; selectedAreaIds: string[] }
    | { ok: false; code: string; message: string };

/** Nombre de la raíz en la UI. */
const ROOT_LABEL = 'Documentos';

/**
 * Borra del Router Cache (navegador) todas las páginas de carpetas de quien
 * hizo el cambio, para que lo vea sin esperar a `staleTimes`. Con `'layout'`
 * aplica a `/DMS/documents` y a todas sus carpetas (`[[...folderId]]`).
 * También `/DMS`, porque "Documentos recientes" muestra nombre y tags y ahí
 * también se puede editar.
 *
 * @example
 * refreshFolderPages()
 */
function refreshFolderPages(): void {
    revalidatePath('/DMS/documents', 'layout');
    revalidatePath('/DMS');
}

/**
 * Crea una carpeta. Solo admin: lo valida RLS (`is_admin()`).
 *
 * @param folderName - nombre de la carpeta, único dentro de su carpeta padre
 * @param parentId - id de la carpeta padre, o `null` para crearla en la raíz
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await createFolder('Auditorías', parentId)
 */
export async function createFolder(folderName: string, parentId: string | null): Promise<FolderActionResult> {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
        return { ok: false, code: 'FOLDER_NAME_REQUIRED', message: 'Escribe un nombre para la carpeta.' };
    }
    try {
        await foldersProvider.createFolder(trimmedName, parentId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('createFolder', err) };
    }
}

/**
 * Cambia el nombre de una carpeta. Solo admin.
 *
 * @param folderId - id de la carpeta
 * @param newFolderName - nombre nuevo, único dentro de su carpeta padre
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await renameFolder(folderId, 'Calidad 2026')
 */
export async function renameFolder(folderId: string, newFolderName: string): Promise<FolderActionResult> {
    try {
        await foldersProvider.renameFolder(folderId, newFolderName);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('renameFolder', err) };
    }
}

/**
 * Mueve una carpeta (con todo su contenido) dentro de otra o a la raíz.
 * Solo admin. El trigger de la base rechaza movimientos que crean ciclos.
 *
 * @param folderId - id de la carpeta que se mueve
 * @param newParentId - id de la carpeta destino, o `null` para la raíz
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await moveFolder(folderId, null)
 */
export async function moveFolder(folderId: string, newParentId: string | null): Promise<FolderActionResult> {
    try {
        await foldersProvider.moveFolder(folderId, newParentId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('moveFolder', err) };
    }
}

/**
 * Borra una carpeta vacía. Solo admin. Falla si tiene subcarpetas o
 * documentos (`ON DELETE RESTRICT`).
 *
 * @param folderId - id de la carpeta
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await deleteFolder(folderId)
 */
export async function deleteFolder(folderId: string): Promise<FolderActionResult> {
    try {
        await foldersProvider.deleteFolder(folderId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('deleteFolder', err) };
    }
}

/**
 * Asigna un área a una carpeta. Solo admin. El área se hereda a sus
 * subcarpetas y documentos (ADR-011).
 *
 * @param folderId - id de la carpeta
 * @param areaId - id del área
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await assignAreaToFolder(folderId, areaId)
 */
export async function assignAreaToFolder(folderId: string, areaId: string): Promise<FolderActionResult> {
    try {
        await foldersProvider.assignAreaToFolder(folderId, areaId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('assignAreaToFolder', err) };
    }
}

/**
 * Quita un área de una carpeta. Solo admin.
 *
 * @param folderId - id de la carpeta
 * @param areaId - id del área
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await removeAreaFromFolder(folderId, areaId)
 */
export async function removeAreaFromFolder(folderId: string, areaId: string): Promise<FolderActionResult> {
    try {
        await foldersProvider.removeAreaFromFolder(folderId, areaId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('removeAreaFromFolder', err) };
    }
}

/**
 * Asigna un documento a una carpeta, lo mueve a otra o lo saca de toda
 * carpeta (`null`). Solo admin. Un documento con soft delete no se mueve.
 *
 * @param documentId - id del documento
 * @param folderId - id de la carpeta destino, o `null` para dejarlo sin carpeta
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await moveDocumentToFolder(documentId, folderId)
 */
export async function moveDocumentToFolder(documentId: string, folderId: string | null): Promise<FolderActionResult> {
    try {
        await documentsProvider.moveDocumentToFolder(documentId, folderId);
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('moveDocumentToFolder', err) };
    }
}

/**
 * Arma las carpetas destino del selector "Ubicación": la raíz más todas las
 * carpetas, cada una con su ruta completa, ordenadas por ruta. Si se edita
 * una carpeta (`excludeFolderId`), quita a esa carpeta y a todas sus
 * subcarpetas, porque moverla ahí formaría un ciclo. La base lo rechaza de
 * todos modos; quitarlas solo evita ofrecer opciones que van a fallar.
 *
 * @param folders - todas las carpetas
 * @param excludeFolderId - carpeta que se edita, o `null` si es un documento
 * @returns la raíz primero y luego las carpetas ordenadas por ruta
 * @example
 * const destinations = buildDestinations(folders, folderId)
 */
function buildDestinations(folders: FolderSummary[], excludeFolderId: string | null): FolderDestination[] {
    const byId = new Map(folders.map((folder) => [folder.id, folder]));

    /**
     * Ruta de una carpeta, de la raíz hacia abajo. `visited` corta si hubiera
     * un ciclo en los datos.
     *
     * @param folder - carpeta de la que se arma la ruta
     * @returns ids y nombres de la raíz a la carpeta
     * @example
     * const chain = ancestry(folder)
     */
    function ancestry(folder: FolderSummary): FolderSummary[] {
        const chain: FolderSummary[] = [];
        const visited = new Set<string>();
        let current: FolderSummary | undefined = folder;
        while (current && !visited.has(current.id)) {
            visited.add(current.id);
            chain.unshift(current);
            current = current.parent_id ? byId.get(current.parent_id) : undefined;
        }
        return chain;
    }

    const destinations = folders
        .map((folder) => ancestry(folder))
        .filter((chain) => !excludeFolderId || !chain.some((step) => step.id === excludeFolderId))
        .map((chain) => ({
            id: chain[chain.length - 1].id,
            label: [ROOT_LABEL, ...chain.map((step) => step.folder_name)].join(' / '),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, 'es'));

    return [{ id: null, label: ROOT_LABEL }, ...destinations];
}

/**
 * Datos para abrir el diálogo "Editar" de una carpeta o un documento: las
 * carpetas destino (con su ruta), todas las áreas y las áreas propias que ya
 * tiene. Se pide al abrir el diálogo, no al pintar la página, para no cargar
 * todo el árbol en cada navegación.
 *
 * @param target - qué se edita (`folder` o `document`) y su id
 * @returns destinos, áreas y áreas seleccionadas, o el error para la UI
 * @example
 * const result = await getEditOptions({ kind: 'folder', id: folderId })
 */
export async function getEditOptions(target: EditTarget): Promise<EditOptionsResult> {
    try {
        const [folders, areas, selectedAreaIds] = await Promise.all([
            foldersProvider.listAllFolders(),
            areasProvider.fetchAllAreas(),
            target.kind === 'folder'
                ? foldersProvider.getFolderAreaIds(target.id)
                : documentsProvider.getDocumentAreaIds(target.id),
        ]);
        const excludeFolderId = target.kind === 'folder' ? target.id : null;
        return {
            ok: true,
            destinations: buildDestinations(folders, excludeFolderId),
            areas,
            selectedAreaIds,
        };
    } catch (err) {
        return { ok: false, ...handleError('getEditOptions', err) };
    }
}

/**
 * Guarda "Editar carpeta": nombre, ubicación y áreas propias en una sola
 * transacción. Solo admin: lo valida `update_folder()` en la base.
 *
 * @param folderId - id de la carpeta
 * @param input - nombre, carpeta padre y lista completa de áreas propias
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await updateFolder(folderId, { folderName: 'Calidad', parentId: null, areaIds: [] })
 */
export async function updateFolder(folderId: string, input: UpdateFolderInput): Promise<FolderActionResult> {
    const folderName = input.folderName.trim();
    if (!folderName) {
        return { ok: false, code: 'FOLDER_NAME_REQUIRED', message: 'Escribe un nombre para la carpeta.' };
    }
    try {
        await foldersProvider.updateFolder(folderId, { ...input, folderName });
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('updateFolder', err) };
    }
}

/**
 * Guarda "Editar documento": nombre, carpeta y áreas propias en una sola
 * transacción. Solo admin: lo valida `update_document()` en la base.
 *
 * @param documentId - id del documento
 * @param input - nombre, carpeta destino y lista completa de áreas propias
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await updateDocument(documentId, { name: 'Manual HACCP', folderId, areaIds: [] })
 */
export async function updateDocument(documentId: string, input: UpdateDocumentInput): Promise<FolderActionResult> {
    const name = input.name.trim();
    if (!name) {
        return { ok: false, code: 'DOCUMENT_NAME_REQUIRED', message: 'Escribe un nombre para el documento.' };
    }
    try {
        await documentsProvider.updateDocument(documentId, { ...input, name });
        refreshFolderPages();
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('updateDocument', err) };
    }
}
