/**
 * Contrato de las operaciones de administración. Los servicios (ej.
 * `service/admin.service.ts`) implementan esta interfaz contra un proveedor
 * específico. Nada fuera de `/lib/core/admin/` debe conocer al proveedor
 * concreto — solo esta forma.
 *
 * Las operaciones que necesitan la secret key no se ejecutan en Next: viven en
 * Edge Functions de Supabase, que validan el rol de quien llama.
 */

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
}
