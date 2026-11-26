import { DmsHome } from "@/components/DMS/DmsHome";
import { FolderContents } from "@/components/DMS/FolderContents";
import { getRecentDocumentIds } from "@/lib/core/documents/recentDocuments";
import { documentsProvider } from "@/lib/core/documents/service/documents.service";
import type { FolderDocument } from "@/lib/core/folders/provider/folders.provider";
import { handleError } from "@/lib/errors/handleError";

/**
 * Página inicial del DMS. Server Component: lee de la cookie los ids de los
 * documentos abiertos recientemente, consulta sus datos actuales y se los pasa
 * a `DmsHome` (cliente), que arma la página con el usuario de `useUser()`.
 * También arma el contenido de la raíz (`FolderContents` sin encabezado),
 * que `DmsHome` muestra solo a usuarios no admin.
 * Si la consulta falla, la página se muestra igual con el mensaje de error
 * en la sección de recientes.
 *
 * @returns la página inicial
 * @example
 * // Next la renderiza en /DMS
 */
export default async function DmsHomePage() {
    let recentDocuments: FolderDocument[] = [];
    let recentError: string | null = null;

    try {
        const recentIds = await getRecentDocumentIds();
        recentDocuments = await documentsProvider.getDocumentsByIds(recentIds);
    } catch (err) {
        recentError = handleError("DmsHomePage", err).message;
    }

    return (
        <DmsHome
            recentDocuments={recentDocuments}
            recentError={recentError}
            // Misma vista que /DMS/documents, sin el encabezado "Documentos".
            rootFolder={<FolderContents folderId={null} hideHeader />}
        />
    );
}
