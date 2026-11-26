import 'server-only';

import { FunctionsHttpError } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { AdminProvider, EditUserInput, InviteUserInput, InvitedUser, ManagedUser } from '../provider/admin.provider';

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

/** Código de Postgres `insufficient_privilege`: quien llama no es admin. */
const INSUFFICIENT_PRIVILEGE = '42501';

/** Código de Postgres `no_data_found`: el usuario no existe. */
const NO_DATA_FOUND = 'P0002';

/** Código de Postgres `invalid_parameter_value`: `remove_user` sobre uno mismo. */
const INVALID_PARAMETER_VALUE = '22023';

/**
 * Código de Postgres cuando falla una llave foránea: el área no existe
 * (`edit_user_data`) o el usuario tiene documentos, carpetas o áreas a su
 * nombre (`remove_user`).
 */
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Error para un `42501` de los RPC de usuarios.
 *
 * @param action - nombre de la operación, para los logs
 * @param message - `error.message` de Postgres
 * @returns el `AccessError` listo para lanzar
 * @example
 * if (error.code === INSUFFICIENT_PRIVILEGE) throw insufficientPrivilege('getAllUsers', error.message)
 */
function insufficientPrivilege(action: string, message: string): AccessError {
    return new AccessError(
        AccessErrorCode.AuthorizationFailure,
        `${action}: permisos insuficientes (42501). ¿Se llamó sin sesión de admin? ${message}`,
        'No cuentas con los permisos necesarios para esta acción.',
        403,
    );
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

    /**
     * Llama al RPC `get_all_users` (SECURITY DEFINER, valida `is_admin()`) y
     * pasa cada fila a {@link ManagedUser}.
     *
     * @returns todos los usuarios, ordenados por nombre
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {AdminError} `ListUsersFailed` si la consulta falla por otra razón
     * @example
     * const users = await adminProvider.getAllUsers()
     */
    async getAllUsers(): Promise<ManagedUser[]> {
        const supabase = await createSupabaseServerClient();

        // TODO: paginación. Hoy trae todos los usuarios; cuando sean muchos,
        // pasar límite y página (o cursor) al RPC.
        const { data, error } = await supabase.rpc('get_all_users');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('getAllUsers', error.message);
            }
            throw new AdminError(
                AdminErrorCode.ListUsersFailed,
                `getAllUsers: ${error.code} ${error.message}`,
                'No se pudo cargar la lista de usuarios. Intenta más tarde.',
                500,
            );
        }

        return data.map((row) => ({
            id: row.id,
            email: row.email,
            nombre: row.nombre,
            apellidoPaterno: row.apellido_paterno,
            apellidoMaterno: row.apellido_materno,
            role: row.role,
            areaId: row.area_id,
            areaName: row.area_name,
            activatedAt: row.activated_at,
            createdAt: row.created_at,
        }));
    }

    /**
     * Llama al RPC `edit_user_data` (SECURITY DEFINER, valida `is_admin()`).
     *
     * @param userId - `id` del usuario
     * @param input - nombre, apellidos y área (`null` para dejarlo sin área)
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {AdminError} `UpdateUserFailed` si el usuario no existe (`P0002`),
     *   si el área no existe (`23503`) o por otro error
     * @example
     * await adminProvider.editUserData(userId, { nombre: "Ana", apellidoPaterno: "López", apellidoMaterno: null, areaId })
     */
    async editUserData(userId: string, input: EditUserInput): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.rpc('edit_user_data', {
            p_user_id: userId,
            p_nombre: input.nombre,
            p_apellido_paterno: input.apellidoPaterno,
            p_apellido_materno: input.apellidoMaterno,
            p_area_id: input.areaId,
        });

        if (!error) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('editUserData', error.message);
        }
        if (error.code === NO_DATA_FOUND) {
            throw new AdminError(
                AdminErrorCode.UpdateUserFailed,
                `editUserData: no existe el usuario ${userId}: ${error.message}`,
                'No se encontró el usuario.',
                404,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new AdminError(
                AdminErrorCode.UpdateUserFailed,
                `editUserData: el área ${input.areaId} no existe: ${error.message}`,
                'El área seleccionada ya no existe.',
                409,
            );
        }
        throw new AdminError(
            AdminErrorCode.UpdateUserFailed,
            `editUserData: ${error.code} ${error.message}`,
            'No se pudieron guardar los cambios. Intenta más tarde.',
            500,
        );
    }

    /**
     * Llama al RPC `remove_user` (SECURITY DEFINER, valida `is_admin()`), que
     * borra la cuenta de `auth.users` y su perfil en cascada.
     *
     * @param userId - `id` del usuario
     * @throws {AccessError} `AuthorizationFailure` si el RPC responde `42501`
     * @throws {AdminError} `RemoveUserFailed` si el usuario no existe (`P0002`),
     *   si es quien llama (`22023`), si tiene documentos, carpetas o áreas a su
     *   nombre (`23503`) o por otro error
     * @example
     * await adminProvider.removeUser(userId)
     */
    async removeUser(userId: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.rpc('remove_user', { p_user_id: userId });

        if (!error) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('removeUser', error.message);
        }
        if (error.code === NO_DATA_FOUND) {
            throw new AdminError(
                AdminErrorCode.RemoveUserFailed,
                `removeUser: no existe el usuario ${userId}: ${error.message}`,
                'No se encontró el usuario.',
                404,
            );
        }
        if (error.code === INVALID_PARAMETER_VALUE) {
            throw new AdminError(
                AdminErrorCode.RemoveUserFailed,
                `removeUser: el admin intentó eliminarse a sí mismo (${userId})`,
                'No puedes eliminar tu propia cuenta.',
                400,
            );
        }
        if (error.code === FOREIGN_KEY_VIOLATION) {
            throw new AdminError(
                AdminErrorCode.RemoveUserFailed,
                `removeUser: ${userId} tiene registros que lo referencian: ${error.message}`,
                'No se puede eliminar: el usuario tiene documentos, carpetas o áreas a su nombre.',
                409,
            );
        }
        throw new AdminError(
            AdminErrorCode.RemoveUserFailed,
            `removeUser: ${error.code} ${error.message}`,
            'No se pudo eliminar el usuario. Intenta más tarde.',
            500,
        );
    }
}

export const adminProvider: AdminProvider = new SupabaseAdminService();
