import { UserPlus } from "lucide-react";

import { LinkButton } from "@/components/DMS/LinkButton";
import { UserList } from "@/components/DMS/UserList";
import type { UserSummary } from "@/components/DMS/UserRow";
import { UserSearch } from "@/components/DMS/UserSearch";

// Datos de ejemplo: se eliminan cuando se conecte la lista real de usuarios.
const EXAMPLE_USERS: UserSummary[] = [
    { id: "1", name: "Ana López", email: "ana.lopez@somameat.com", role: "area_admin", area: "Calidad" },
    { id: "2", name: "Carlos Ramírez", email: "carlos.ramirez@somameat.com", role: "user", area: "Producción" },
    { id: "3", name: "María Torres", email: "maria.torres@somameat.com", role: "user", area: "Marca" },
];

/**
 * Dashboard de gestión de usuarios. Por ahora solo es visual: la búsqueda, el
 * filtro y las acciones no tienen funcionalidad. El acceso a esta ruta lo
 * controla el proxy.
 *
 * @returns la página de gestión de usuarios
 */
export default function UserManagementPage() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-soma-brown md:text-3xl">Gestión de usuarios</h1>
                    <p className="text-sm text-soma-brown/70">Administra quién tiene acceso al DMS.</p>
                </div>
                <LinkButton
                    href="/DMS/admin/invite-user"
                    label="Agregar usuario"
                    icon={UserPlus}
                    primary
                    className="md:w-auto"
                />
            </header>
            <UserSearch />
            <UserList users={EXAMPLE_USERS} />
        </div>
    );
}
