"use client";

import { AdminPanel } from "@/components/DMS/AdminPanel";
import { DashboardHeader } from "@/components/DMS/DashboardHeader";
import { FolderOpen } from "lucide-react";

import { DocumentSearch } from "@/components/DMS/DocumentSearch";
import { LinkButton } from "@/components/DMS/LinkButton";
import { RecentDocuments } from "@/components/DMS/RecentDocuments";
import { isAdminRole } from "@/lib/core/auth/roles";
import { useUser } from "@/lib/core/context/userContext";
import type { FolderDocument } from "@/lib/core/folders/provider/folders.provider";

interface DmsHomeProps {
    /** Documentos recientes ya leídos en el servidor (`DMS/page.tsx`). */
    recentDocuments: FolderDocument[];
    /** Mensaje para el usuario si no se pudieron leer los recientes. */
    recentError: string | null;
    /**
     * Contenido de la raíz ("Documentos") ya armado en el servidor
     * (`<FolderContents folderId={null} hideHeader />`). Solo se muestra a
     * quien no es admin.
     */
    rootFolder: React.ReactNode;
}

/**
 * Contenido de la página inicial del DMS. Es cliente porque usa `useUser()`;
 * los documentos recientes y la raíz llegan ya resueltos desde el Server
 * Component. No redirige cuando `user` es `null`: justo después del login el
 * perfil todavía viene en camino, y proteger la ruta le toca al proxy.
 *
 * - Admin: búsqueda, "Explorar documentos", recientes y panel de administración.
 * - No admin: los recientes y debajo el contenido de la raíz (con su propia búsqueda).
 *
 * @param recentDocuments - documentos abiertos recientemente
 * @param recentError - error al leer los recientes, o `null`
 * @param rootFolder - contenido de la raíz para usuarios no admin
 * @returns la página inicial, o un estado neutro mientras no hay usuario
 * @example
 * <DmsHome recentDocuments={recent} recentError={null} rootFolder={<FolderContents folderId={null} hideHeader />} />
 */
export function DmsHome({ recentDocuments, recentError, rootFolder }: DmsHomeProps) {
    const { user } = useUser();

    if (!user) {
        return <p className="px-4 py-10 text-center text-sm text-soma-brown/70">Cargando...</p>;
    }

    const isAdmin = isAdminRole(user.role);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
            <DashboardHeader name={user.name} role={user.role} />
            {isAdmin ? (
                <>
                    <DocumentSearch />
                    <LinkButton href="/DMS/documents" label="Explorar documentos" icon={FolderOpen} primary className="md:w-auto" />
                    <RecentDocuments documents={recentDocuments} errorMessage={recentError} />
                    <AdminPanel />
                </>
            ) : (
                <>
                    <RecentDocuments documents={recentDocuments} errorMessage={recentError} />
                    {rootFolder}
                </>
            )}
        </div>
    );
}
