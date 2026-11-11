import { DmsBadge } from "@/components/DMS/DmsBadge";
import { DmsSection } from "@/components/DMS/DmsSection";
import { UserRow, type UserSummary } from "@/components/DMS/UserRow";

/**
 * Lista de usuarios. Recibe los usuarios por props para poder cambiar los
 * datos de ejemplo por los reales sin modificar este componente.
 *
 * @param users - usuarios a mostrar
 * @returns la sección con la lista de usuarios
 * @example
 * <UserList users={usuarios} />
 */
export function UserList({ users }: { users: UserSummary[] }) {
    return (
        <DmsSection title="Usuarios" aside={<DmsBadge>Datos de ejemplo</DmsBadge>}>
            <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                {users.map((user) => (
                    <UserRow key={user.id} user={user} />
                ))}
            </ul>
        </DmsSection>
    );
}
