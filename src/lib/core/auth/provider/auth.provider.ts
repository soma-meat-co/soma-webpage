/**
 * Contrato de autenticación. Los servicios (ej. `service/user.service.ts`)
 * implementan esta interfaz contra un proveedor específico (Supabase hoy,
 * otro mañana). Nada fuera de `/lib/core/auth/` debe conocer al proveedor
 * concreto — solo esta forma.
 */

export type Role = 'user' | 'admin';
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
 * Operaciones de autenticación que cualquier proveedor debe implementar.
 */
export interface AuthProvider {
    /**
     * Inicia sesión con correo y contraseña.
     *
     * @param email - correo del usuario
     * @param password - contraseña en texto plano
     * @returns la sesión normalizada del usuario autenticado
     * @throws {AuthError} si las credenciales son inválidas o el proveedor falla
     */
    login(email: string, password: string): Promise<AuthSession>;
}
