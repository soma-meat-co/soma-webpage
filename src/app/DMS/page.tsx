"use client";

import { AdminPanel } from "@/components/DMS/AdminPanel";
import { DashboardHeader } from "@/components/DMS/DashboardHeader";
import type { DocumentSummary } from "@/components/DMS/DocumentRow";
import { DocumentSearch } from "@/components/DMS/DocumentSearch";
import { RecentDocuments } from "@/components/DMS/RecentDocuments";
import { isAdminRole } from "@/lib/core/auth/roles";
import { useUser } from "@/lib/core/context/userContext";

// Datos de ejemplo: se eliminan cuando exista la tabla de documentos.
const EXAMPLE_DOCUMENTS: DocumentSummary[] = [
    { id: "1", name: "Brand Book v3.0", tags: ["Marca"], updatedAt: "12 oct 2026" },
    { id: "2", name: "Manual HACCP", tags: ["Calidad"], updatedAt: "3 oct 2026" },
    { id: "3", name: "Ficha técnica de producto", tags: ["Producción"], updatedAt: "28 sep 2026" },
];

/**
 * Página inicial del DMS. No redirige cuando `user` es `null`: justo después
 * del login el perfil todavía viene en camino, y proteger la ruta le toca al
 * proxy, que lee la sesión en el servidor.
 *
 * @returns la página inicial, o un estado neutro mientras no hay usuario
 */
export default function DmsHomePage() {
    const { user } = useUser();

    if (!user) {
        return <p className="px-4 py-10 text-center text-sm text-soma-brown/70">Cargando...</p>;
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
            <DashboardHeader name={user.name} role={user.role} />
            <DocumentSearch />
            <RecentDocuments documents={EXAMPLE_DOCUMENTS} />
            {isAdminRole(user.role) && <AdminPanel />}
        </div>
    );
}
