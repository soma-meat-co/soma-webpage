'use server'

import { areasProvider } from "@/lib/core/areas/service/area.service";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { AppError } from "@/lib/errors/base";

export type AreaActionResult =
    | {ok: true}
    | {ok: false; code: string; message: string};

export type FetchAreasResult =
    | {ok: true; areas: Area[]}
    | {ok: false; code: string; message: string};

/**
 * Convierte cualquier error del service en la respuesta `{ok: false}` de una
 * action. El detalle va a los logs del servidor; al cliente solo llega el
 * mensaje genérico.
 *
 * @param action - nombre de la action, para el log
 * @param err - error capturado
 * @returns la respuesta de error para el cliente
 * @example
 * catch (err) { return toActionError('createArea', err) }
 */
function toActionError(action: string, err: unknown): {ok: false; code: string; message: string} {
    if (err instanceof AppError) {
        console.error(`[${action}] ${err.code} (${err.statusCode}): ${err.detail}`);
        return {ok: false, code: err.code, message: err.genericMessage};
    }
    console.error(`[${action}] error inesperado: `, err);
    return {ok: false, code: 'UNEXPECTED_ERROR', message: 'Ocurrió un error inesperado. Intenta más tarde.'};
}

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
        return toActionError('createArea', err);
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
        return toActionError('editArea', err);
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
        return toActionError('deleteArea', err);
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
        return toActionError('fetchAllAreas', err);
    }
}
