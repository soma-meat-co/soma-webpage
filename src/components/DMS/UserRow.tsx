import { Pencil } from "lucide-react";

import { ComingSoonButton } from "@/components/DMS/ComingSoonButton";
import { DmsBadge } from "@/components/DMS/DmsBadge";

export interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: string;
    area: string;
}

/**
 * Fila de un usuario: nombre, correo, rol, área y acción de editar. En mobile
 * la acción va debajo de los datos; desde `md` va a la derecha.
 *
 * @param user - usuario a mostrar
 * @returns la fila del usuario
 * @example
 * <UserRow user={usuario} />
 */
export function UserRow({ user }: { user: UserSummary }) {
    return (
        <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5">
                <p className="truncate text-sm font-semibold text-soma-brown">{user.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <DmsBadge>{user.role}</DmsBadge>
                    <DmsBadge>{user.area}</DmsBadge>
                    <span className="truncate text-xs text-soma-brown/70">{user.email}</span>
                </div>
            </div>
            <div className="flex md:shrink-0">
                <ComingSoonButton label="Editar" icon={Pencil} className="flex-1 md:flex-none" />
            </div>
        </li>
    );
}
