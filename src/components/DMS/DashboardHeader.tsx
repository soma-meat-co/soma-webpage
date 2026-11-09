import { DmsBadge } from "@/components/DMS/DmsBadge";
import type { Role } from "@/lib/core/auth/provider/auth.provider";
import { isAdminRole } from "@/lib/core/auth/roles";

/**
 * Encabezado de la página inicial. Saluda al usuario y solo muestra el rol
 * si es administrativo.
 *
 * @param name - nombre del usuario
 * @param role - rol del usuario
 * @returns el encabezado
 * @example
 * <DashboardHeader name={user.name} role={user.role} />
 */
export function DashboardHeader({ name, role }: { name: string; role: Role }) {
    return (
        <header className="space-y-2">
            <h1 className="text-2xl font-bold text-soma-brown md:text-3xl">Hola, {name}</h1>
            {isAdminRole(role) && <DmsBadge>{role}</DmsBadge>}
        </header>
    );
}
