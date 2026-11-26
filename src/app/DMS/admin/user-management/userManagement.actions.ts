'use server'

import { revalidatePath } from "next/cache";

import { adminProvider } from "@/lib/core/admin/service/admin.service";
import type { EditUserInput } from "@/lib/core/admin/provider/admin.provider";
import { handleError } from "@/lib/errors/handleError";

export type UserActionResult =
    | { ok: true }
    | { ok: false; code: string; message: string };

/**
 * Guarda el nombre y el área de un usuario desde el diálogo "Editar" de
 * `/DMS/admin/user-management`. No valida permisos aquí: `edit_user_data`
 * rechaza en la base a quien no es admin. No lanza: todo error se devuelve
 * como `{ ok: false, ... }`.
 *
 * @param userId - `id` del usuario
 * @param input - nombre, apellidos y área (`null` para dejarlo sin área)
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await editUserData(user.id, { nombre, apellidoPaterno, apellidoMaterno, areaId })
 */
export async function editUserData(userId: string, input: EditUserInput): Promise<UserActionResult> {
    const nombre = input.nombre.trim();
    const apellidoPaterno = input.apellidoPaterno.trim();
    const apellidoMaterno = input.apellidoMaterno?.trim() || null;

    if (!nombre || !apellidoPaterno) {
        return { ok: false, code: 'USER_NAME_REQUIRED', message: 'El nombre y el apellido paterno son obligatorios.' };
    }

    try {
        await adminProvider.editUserData(userId, { nombre, apellidoPaterno, apellidoMaterno, areaId: input.areaId });
        revalidatePath('/DMS/admin/user-management');
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('editUserData', err) };
    }
}

/**
 * Elimina la cuenta de un usuario desde el diálogo "Eliminar" de
 * `/DMS/admin/user-management`. No valida permisos aquí: `remove_user`
 * rechaza en la base a quien no es admin y a quien intenta eliminarse a sí
 * mismo. No lanza: todo error se devuelve como `{ ok: false, ... }`.
 *
 * @param userId - `id` del usuario
 * @returns `{ok: true}` o el error para mostrar en la UI
 * @example
 * const result = await removeUser(user.id)
 */
export async function removeUser(userId: string): Promise<UserActionResult> {
    try {
        await adminProvider.removeUser(userId);
        revalidatePath('/DMS/admin/user-management');
        return { ok: true };
    } catch (err) {
        return { ok: false, ...handleError('removeUser', err) };
    }
}
