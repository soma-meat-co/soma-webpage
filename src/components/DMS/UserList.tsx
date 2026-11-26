import { DmsSection } from "@/components/DMS/DmsSection";
import { UserRow } from "@/components/DMS/UserRow";
import type { ManagedUser } from "@/lib/core/admin/provider/admin.provider";
import type { Area } from "@/lib/core/areas/provider/areas.provider";

/**
 * Lista de usuarios.
 *
 * @param users - usuarios a mostrar
 * @param areas - áreas para el diálogo "Editar" de cada fila
 * @returns la sección con la lista de usuarios
 * @example
 * <UserList users={users} areas={areas} />
 */
export function UserList({ users, areas }: { users: ManagedUser[]; areas: Area[] }) {
    return (
        <DmsSection title="Usuarios">
            <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                {users.map((user) => (
                    <UserRow key={user.id} user={user} areas={areas} />
                ))}
            </ul>
        </DmsSection>
    );
}
