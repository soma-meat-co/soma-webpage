'use server';

import { adminProvider } from '@/lib/core/admin/service/admin.service';
import type { InviteUserInput } from '@/lib/core/admin/provider/admin.provider';
import { AppError } from '@/lib/errors/base';

/** Código para errores que no son `AppError` (red, bugs, etc.). */
const UNEXPECTED_ERROR = 'UNEXPECTED_ERROR';

/**
 * Resultado de la invitación. Es un objeto plano porque las clases de error no
 * sobreviven el paso del servidor al cliente: Next las serializa y en
 * producción reemplaza su mensaje por uno genérico.
 */
export type InviteUserResult =
    | { ok: true; email: string }
    | { ok: false; code: string; message: string };

/**
 * Server Action que invita a un usuario al DMS desde el formulario de
 * `/DMS/admin/invite-user`. No valida permisos aquí: `adminProvider` invoca la
 * Edge Function con la sesión de quien llama y la función rechaza a quien no
 * sea admin. Tampoco lanza: todo error se devuelve como `{ ok: false, ... }`.
 *
 * @param input - correo institucional y nombre del usuario a invitar
 * @returns `{ ok: true, email }` si se envió la invitación, o
 *   `{ ok: false, code, message }` con el código del `AppError` (o
 *   `UNEXPECTED_ERROR`) y un mensaje listo para mostrar al usuario
 * @example
 * const result = await inviteUserAction({ email, nombre, apellidoPaterno })
 * if (!result.ok) setError(result.message)
 */
export async function inviteUserAction(input: InviteUserInput): Promise<InviteUserResult> {
    try {
        const invited = await adminProvider.inviteNewUser(input);
        return { ok: true, email: invited.email };
    } catch (err) {
        if (err instanceof AppError) {
            console.error(`[inviteUserAction] ${err.code} (${err.statusCode}): ${err.detail}`);
            return { ok: false, code: err.code, message: err.genericMessage };
        }

        console.error('[inviteUserAction] error inesperado:', err);
        return {
            ok: false,
            code: UNEXPECTED_ERROR,
            message: 'Ocurrió un error inesperado. Intenta más tarde.',
        };
    }
}
