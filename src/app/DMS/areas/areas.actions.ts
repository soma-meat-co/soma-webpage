'use server'

import { areasProvider } from "@/lib/core/areas/service/area.service";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { handleError } from "@/lib/errors/handleError";

export type AreaActionResult =
    | {ok: true}
    | {ok: false; code: string; message: string};

export type FetchAreasResult =
    | {ok: true; areas: Area[]}
    | {ok: false; code: string; message: string};

/**
 * Crea un área.
 *
 * @param name - nombre del área
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await createArea('Marketing')
 */
export async function createArea(name: string): Promise<AreaActionResult> {
    try {
        await areasProvider.createNewArea(name);
        return {ok: true};
    } catch (err) {
        return {ok: false, ...handleError('createArea', err)};
    }
}

/**
 * Cambia el nombre de un área.
 *
 * @param id - `id` del área
 * @param newName - nombre nuevo
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await editArea(areaId, 'Ventas')
 */
export async function editArea(id: string, newName: string): Promise<AreaActionResult> {
    try {
        await areasProvider.editArea(id, newName);
        return {ok: true};
    } catch (err) {
        return {ok: false, ...handleError('editArea', err)};
    }
}

/**
 * Borra un área.
 *
 * @param id - `id` del área
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await deleteArea(areaId)
 */
export async function deleteArea(id: string): Promise<AreaActionResult> {
    try {
        await areasProvider.deleteArea(id);
        return {ok: true};
    } catch (err) {
        return {ok: false, ...handleError('deleteArea', err)};
    }
}

/**
 * Lista las áreas visibles para el usuario.
 *
 * @returns las áreas, o el error para mostrar en la UI
 * @example
 * const result = await fetchAllAreas()
 */
export async function fetchAllAreas(): Promise<FetchAreasResult> {
    try {
        const areas = await areasProvider.fetchAllAreas();
        return {ok: true, areas};
    } catch (err) {
        return {ok: false, ...handleError('fetchAllAreas', err)};
    }
}
