import { Tags, Upload, Users } from "lucide-react";

import { ComingSoonButton } from "@/components/DMS/ComingSoonButton";
import { DmsBadge } from "@/components/DMS/DmsBadge";
import { DmsSection } from "@/components/DMS/DmsSection";
import { LinkButton } from "@/components/DMS/LinkButton";

/**
 * Acciones de administración. Quien lo usa decide si mostrarlo según el rol.
 *
 * @returns la sección de administración
 * @example
 * {isAdminRole(user.role) && <AdminPanel />}
 */
export function AdminPanel() {
    return (
        <DmsSection title="Administración" aside={<DmsBadge>Próximamente</DmsBadge>}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <ComingSoonButton label="Subir documento" icon={Upload} primary />
                <LinkButton href="/DMS/admin/user-management" label="Usuarios" icon={Users} />
                <ComingSoonButton label="Tags" icon={Tags} />
            </div>
        </DmsSection>
    );
}
