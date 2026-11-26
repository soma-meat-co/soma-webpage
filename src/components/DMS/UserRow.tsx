import { DmsBadge } from "@/components/DMS/DmsBadge";
import { EditUserButton } from "@/components/DMS/EditUserButton";
import { RemoveUserButton } from "@/components/DMS/RemoveUserButton";
import type { ManagedUser } from "@/lib/core/admin/provider/admin.provider";
import type { Area } from "@/lib/core/areas/provider/areas.provider";

/**
 * Nombre completo para mostrar. Si el usuario no tiene nombre (ej. invitado
 * sin datos), usa el correo.
 *
 * @param user - usuario
 * @returns nombre y apellidos separados por espacio, o el correo
 * @example
 * fullName(user) // "Ana López Torres"
 */
function fullName(user: ManagedUser): string {
    const name = [user.nombre, user.apellidoPaterno, user.apellidoMaterno].filter(Boolean).join(" ");
    return name || user.email;
}

/**
 * Fila de un usuario: nombre, correo, rol, área y acciones de editar y
 * eliminar. En mobile las acciones van debajo de los datos; desde `md` van a
 * la derecha.
 *
 * @param user - usuario a mostrar
 * @param areas - áreas para el diálogo "Editar"
 * @returns la fila del usuario
 * @example
 * <UserRow user={user} areas={areas} />
 */
export function UserRow({ user, areas }: { user: ManagedUser; areas: Area[] }) {
    return (
        <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5">
                <p className="truncate text-sm font-semibold text-soma-brown">{fullName(user)}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <DmsBadge>{user.role}</DmsBadge>
                    <DmsBadge>{user.areaName ?? "Sin área"}</DmsBadge>
                    <span className="truncate text-xs text-soma-brown/70">{user.email}</span>
                </div>
            </div>
            <div className="flex gap-2 md:shrink-0">
                <EditUserButton user={user} areas={areas} />
                <RemoveUserButton user={user} />
            </div>
        </li>
    );
}
