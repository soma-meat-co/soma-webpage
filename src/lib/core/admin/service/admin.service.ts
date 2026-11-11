import 'server-only';

import { FunctionsHttpError } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { AdminProvider, InviteUserInput, InvitedUser } from '../provider/admin.provider';

// INDEX: Error imports
import { AppError } from '@/lib/errors/base';
import { AccessError, AccessErrorCode } from '@/lib/errors/access';
import { AdminError, AdminErrorCode } from '@/lib/errors/admin';
import { AuthError, AuthErrorCode } from '@/lib/errors/auth';

/** Formato de error que devuelven las Edge Functions: `{ code, message }`. */
interface EdgeFunctionErrorBody {
    code?: string;
    message?: string;
}

/**
 * Traduce el error de una Edge Function a un `AppError` del proyecto. Se guía
 * por el `code` del body, que es estable; el status HTTP solo se usa cuando el
 * body no trae `code` (por ejemplo, el 401 que devuelve Supabase sin JWT).
 *
 * @param functionName - nombre de la Edge Function, para el detalle del error
 * @param error - error devuelto por `supabase.functions.invoke`
 * @returns el `AppError` correspondiente, listo para lanzarse
 * @example
 * if (error) throw await toAppError('invite-user-as-admin', error)
 */
async function toAppError(functionName: string, error: unknown): Promise<AppError> {
    // Error de red o de la infraestructura de Supabase: la función no llegó a responder.
    if (!(error instanceof FunctionsHttpError)) {
        const detail = error instanceof Error ? error.message : String(error);
        return new AdminError(
            AdminErrorCode.InviteFailed,
            `${functionName} no respondió: ${detail}`,
            'No se pudo completar la operación. Intenta más tarde.',
            500,
        );
    }

    const response: Response = error.context;
    const body: EdgeFunctionErrorBody = await response.json().catch(() => ({}));
    const detail = `${functionName} respondió ${response.status} ${body.code ?? ''}: ${body.message ?? ''}`;

    switch (body.code) {
        case 'forbidden':
            return new AccessError(AccessErrorCode.AuthorizationFailure, detail, 'No tienes permisos suficientes para realizar esta acción.', 403);
        case 'admin_check_failed':
            return new AccessError(AccessErrorCode.RoleCheckFailed, detail, 'No se pudieron verificar tus permisos. Intenta más tarde.', 500);
        case 'invalid_body':
            return new AdminError(AdminErrorCode.InvalidInput, detail, 'Faltan datos obligatorios o el correo no es válido.', 400);
        case 'email_not_institutional':
            return new AdminError(AdminErrorCode.EmailNotInstitutional, detail, 'El correo tiene que ser institucional (@somameat.com).', 422);
        case 'email_exists':
            return new AdminError(AdminErrorCode.EmailExists, detail, 'Ya existe un usuario con ese correo.', 409);
    }

    if (response.status === 401) {
        return new AuthError(AuthErrorCode.AuthenticationFailure, detail, 'Inicia sesión para continuar.', 401);
    }

    return new AdminError(AdminErrorCode.InviteFailed, detail, 'No se pudo completar la operación. Intenta más tarde.', 500);
}

class SupabaseAdminService implements AdminProvider {
    /**
     * Invita a un usuario nuevo a través de la Edge Function `invite-user-as-admin`.
     * La función recibe el JWT de quien llama, valida que sea admin con
     * `is_admin()` y usa la secret key del lado de Supabase; Next nunca la toca.
     *
     * @param input - correo institucional y nombre del usuario a invitar
     * @returns el `id` y `email` del usuario invitado
     * @throws {AuthError} `AuthenticationFailure` si no hay sesión válida
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin;
     *   `RoleCheckFailed` si no se pudo verificar el rol
     * @throws {AdminError} `InvalidInput`, `EmailNotInstitutional`, `EmailExists`
     *   o `InviteFailed` según la respuesta de la función
     * @example
     * const invited = await adminProvider.inviteNewUser({
     *   email: "ana@somameat.com",
     *   nombre: "Ana",
     *   apellidoPaterno: "López",
     * })
     */
    async inviteNewUser(input: InviteUserInput): Promise<InvitedUser> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.functions.invoke<InvitedUser>('invite-user-as-admin', {
            body: {
                email: input.email,
                nombre: input.nombre,
                apellido_paterno: input.apellidoPaterno,
                apellido_materno: input.apellidoMaterno,
            },
        });

        if (error) {
            throw await toAppError('invite-user-as-admin', error);
        }

        if (!data) {
            throw new AdminError(
                AdminErrorCode.InviteFailed,
                'invite-user-as-admin respondió sin datos.',
                'No se pudo completar la operación. Intenta más tarde.',
                500,
            );
        }

        return data;
    }
}

export const adminProvider: AdminProvider = new SupabaseAdminService();
