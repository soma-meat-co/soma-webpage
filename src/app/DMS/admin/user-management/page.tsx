import { UserPlus } from "lucide-react";

import { adminProvider } from "@/lib/core/admin/service/admin.service";
import type { ManagedUser } from "@/lib/core/admin/provider/admin.provider";
import { areasProvider } from "@/lib/core/areas/service/area.service";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { handleError } from "@/lib/errors/handleError";
import { LinkButton } from "@/components/DMS/LinkButton";
import { UserList } from "@/components/DMS/UserList";
import { UserSearch } from "@/components/DMS/UserSearch";

/**
 * Dashboard de gestión de usuarios: lista todos los usuarios y permite
 * editarlos (nombre y área). La búsqueda y el filtro todavía no tienen
 * funcionalidad. El acceso a esta ruta lo controla el proxy, y
 * `get_all_users()` vuelve a validar `is_admin()` en la base.
 *
 * @returns la página de gestión de usuarios
 */
export default async function UserManagementPage() {
    let users: ManagedUser[] = [];
    let areas: Area[] = [];
    let errorMessage: string | null = null;

    try {
        // TODO: paginación. Hoy se traen todos los usuarios de una vez.
        [users, areas] = await Promise.all([adminProvider.getAllUsers(), areasProvider.fetchAllAreas()]);
    } catch (err) {
        errorMessage = handleError("UserManagementPage", err).message;
    }

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
            {errorMessage ? (
                <p role="alert" className="rounded-lg bg-soma-red/10 px-4 py-3 text-sm text-soma-red">
                    {errorMessage}
                </p>
            ) : (
                <UserList users={users} areas={areas} />
            )}
        </div>
    );
}
