/**
 * Contrato de autenticación. Los servicios (ej. `service/user.service.ts`)
 * implementan esta interfaz contra un proveedor específico (Supabase hoy,
 * otro mañana). Nada fuera de `/lib/core/auth/` debe conocer al proveedor
 * concreto — solo esta forma.
 */

export type Role = 'user' | 'admin' | 'superadmin';
/**
 * Sesión normalizada, independiente del proveedor de auth.
 */
export interface AuthSession {
    userId: string;
    email: string;
    name: string;
    accessToken: string;
    role: Role;
}

/**
 * Datos del usuario autenticado que la UI necesita mostrar. No incluye tokens:
 * la sesión la administra el proveedor de auth.
 */
export interface CurrentUser {
    email: string;
    name: string;
    role: Role;
}

/**
 * Operaciones de autenticación que cualquier proveedor debe implementar.
 */
export interface AuthProvider {
    /**
     * Inicia sesión con correo y contraseña.
     *
     * @param email - correo del usuario
     * @param password - contraseña en texto plano
     * @throws {AuthError} si las credenciales son inválidas o el proveedor falla
     */
    login(email: string, password: string): Promise<void>;

    /**
     * Acepta una invitación: valida el token del correo y establece la
     * contraseña del usuario invitado. El token se consume aquí, no al abrir
     * el link, para que los escáneres de correo no lo invaliden.
     *
     * @param tokenHash - `token_hash` que llega en el link del correo de invitación
     * @param password - contraseña nueva en texto plano
     * @throws {AuthError} `WeakPassword` si la contraseña no tiene al menos 8
     *   caracteres, un número y un símbolo especial; `LinkInvalid` si el token
     *   expiró o ya se usó; `OtpVerificationError` si ocurrió un error
     *   inesperado al verificar el link; `NewPasswordError` si no se pudo
     *   guardar la contraseña
     * @example
     * await authProvider.acceptInvite(tokenHash, "soma-2026")
     */
    acceptInvite(tokenHash: string, password: string): Promise<void>;

    /**
     * Obtiene el usuario de la sesión activa junto con los datos de su perfil.
     *
     * @returns el usuario autenticado, o `null` si no hay sesión
     * @throws {UserError} si hay sesión pero no se pudo cargar el perfil
     * @example
     * const user = await authProvider.getCurrentUser()
     * if (user) console.log(user.name, user.role)
     */
    getCurrentUser(): Promise<CurrentUser | null>;

    /**
     * Se suscribe a los cambios de sesión (inicio, cierre y renovación). Se
     * ejecuta también al suscribirse, con el estado inicial de la sesión.
     *
     * @param callback - función que se ejecuta en cada cambio de sesión
     * @returns función que cancela la suscripción
     * @example
     * const unsubscribe = authProvider.onAuthChange(() => {
     *   void authProvider.getCurrentUser().then(setUser)
     * })
     */
    onAuthChange(callback: () => void): () => void;

    /**
     * Cierra la sesión del usuario actual.
     *
     * @throws {AuthError} si el proveedor no pudo cerrar la sesión
     * @example
     * await authProvider.logout()
     */
    logout(): Promise<void>;

    /**
     * Recupera una cuenta: valida el token del correo de recuperación y
     * establece la contraseña nueva. Deja una sesión activa.
     *
     * @param tokenHash - `token_hash` que llega en el link del correo de recuperación
     * @param password - contraseña nueva en texto plano
     * @throws {AuthError} `WeakPassword` si la contraseña no tiene al menos 8
     *   caracteres, un número y un símbolo especial; `LinkInvalid` si el token
     *   expiró o ya se usó; `OtpVerificationError` si ocurrió un error
     *   inesperado al verificar el link; `NewPasswordError` si no se pudo
     *   guardar la contraseña
     * @example
     * await authProvider.setNewPassword(tokenHash, "soma-2026")
     */
    setNewPassword(tokenHash: string, password: string) : Promise<void>;

    /**
     * Solicita el correo de recuperación de contraseña. El correo solo se envía
     * si existe una cuenta con esa dirección, pero la función termina con éxito
     * en ambos casos para no revelar qué correos están registrados.
     *
     * @param email - correo institucional (`@somameat.com`) del usuario
     * @throws {AuthError} `PasswordResetRequestError` si el correo no se pudo enviar
     * @example
     * await authProvider.requestPasswordReset("ana@somameat.com")
     */
    requestPasswordReset(email: string): Promise<void>;
 }
