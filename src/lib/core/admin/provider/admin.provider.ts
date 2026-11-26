/**
 * Contrato de las operaciones de administración. Los servicios (ej.
 * `service/admin.service.ts`) implementan esta interfaz contra un proveedor
 * específico. Nada fuera de `/lib/core/admin/` debe conocer al proveedor
 * concreto — solo esta forma.
 *
 * Las operaciones que necesitan la secret key no se ejecutan en Next: viven en
 * Edge Functions de Supabase, que validan el rol de quien llama.
 */

import type { Role } from '@/lib/core/auth/provider/auth.provider';

/**
 * Datos para invitar a un usuario nuevo. El rol no se recibe: todo usuario
 * invitado queda como `user`.
 */
export interface InviteUserInput {
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
}

/**
 * Usuario recién invitado. Todavía no tiene contraseña ni sesión.
 */
export interface InvitedUser {
    id: string;
    email: string;
}

/**
 * Usuario en la gestión de usuarios: su perfil, su correo y su área.
 */
export interface ManagedUser {
    id: string;
    email: string;
    nombre: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    role: Role;
    /** `null` si todavía no tiene área asignada. */
    areaId: string | null;
    areaName: string | null;
    /** Fecha en que creó su contraseña; `null` si no ha aceptado la invitación. */
    activatedAt: string | null;
    createdAt: string;
}

/**
 * Datos que un admin puede cambiar de un usuario. El rol no se edita aquí.
 */
export interface EditUserInput {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
    /** Área del usuario, o `null` para dejarlo sin área. */
    areaId: string | null;
}

/**
 * Operaciones que solo un admin puede ejecutar.
 */
export interface AdminProvider {
    /**
     * Invita a un usuario nuevo y le envía el correo de activación. Quien llama
     * debe tener sesión y rol de admin; la validación ocurre del lado de Supabase.
     *
     * @param input - correo institucional (`@somameat.com`) y nombre del usuario
     * @returns el `id` y `email` del usuario invitado
     * @throws {AuthError} `AuthenticationFailure` si no hay sesión válida
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin;
     *   `RoleCheckFailed` si no se pudo verificar el rol
     * @throws {AdminError} `InvalidInput` si faltan datos; `EmailNotInstitutional`
     *   si el correo no es `@somameat.com`; `EmailExists` si ya hay una cuenta con
     *   ese correo; `InviteFailed` si la invitación falló por otra razón
     * @example
     * const invited = await adminProvider.inviteNewUser({
     *   email: "ana@somameat.com",
     *   nombre: "Ana",
     *   apellidoPaterno: "López",
     * })
     */
    inviteNewUser(input: InviteUserInput): Promise<InvitedUser>;

    /**
     * Lista todos los usuarios con su correo y su área, ordenados por nombre.
     * Solo admin. Todavía no pagina: trae todos.
     *
     * @returns todos los usuarios
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {AdminError} `ListUsersFailed` si la consulta falla por otra razón
     * @example
     * const users = await adminProvider.getAllUsers()
     */
    getAllUsers(): Promise<ManagedUser[]>;

    /**
     * Cambia el nombre y el área de un usuario. Solo admin.
     *
     * @param userId - `id` del usuario
     * @param input - nombre, apellidos y área (`null` para dejarlo sin área)
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {AdminError} `UpdateUserFailed` si el usuario o el área no existen,
     *   o si la actualización falla por otra razón
     * @example
     * await adminProvider.editUserData(userId, { nombre: "Ana", apellidoPaterno: "López", apellidoMaterno: null, areaId })
     */
    editUserData(userId: string, input: EditUserInput): Promise<void>;

    /**
     * Elimina la cuenta de un usuario (y su perfil). Solo admin; nadie puede
     * eliminarse a sí mismo.
     *
     * @param userId - `id` del usuario
     * @throws {AccessError} `AuthorizationFailure` si quien llama no es admin
     * @throws {AdminError} `RemoveUserFailed` si el usuario no existe, si es
     *   quien llama, si tiene documentos, carpetas o áreas a su nombre, o si
     *   falla por otra razón
     * @example
     * await adminProvider.removeUser(userId)
     */
    removeUser(userId: string): Promise<void>;
}
