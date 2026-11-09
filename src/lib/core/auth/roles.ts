import type { Role } from '@/lib/core/auth/provider/auth.provider';

/**
 * Indica si un rol tiene permisos de administración. Solo decide qué muestra
 * la UI: los permisos reales se validan en el servidor.
 *
 * @param role - rol del usuario
 * @returns `true` si el rol es `admin` o `superadmin`
 * @example
 * if (isAdminRole(user.role)) mostrarAdministracion()
 */
export function isAdminRole(role: Role): boolean {
    return role === 'admin' || role === 'superadmin';
}
