import { notFound } from "next/navigation";

import { FolderContents } from "@/components/DMS/FolderContents";

/** Forma de un UUID. Un `folderId` que no la cumple ni se consulta: es 404. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Página de navegación de carpetas. `/DMS/documents` es la raíz y
 * `/DMS/documents/<id>` es una carpeta (ruta catch-all opcional). Valida la
 * URL y delega el contenido en {@link FolderContents}.
 *
 * Responde 404 si la URL trae más de un segmento, si el id no es un UUID o si
 * la carpeta no existe (esto último lo decide `FolderContents`).
 *
 * @param params - segmentos de la URL; `folderId` no viene en la raíz
 * @returns la página de la carpeta
 * @example
 * // /DMS/documents          → raíz
 * // /DMS/documents/abc-123  → carpeta abc-123
 */
export default async function DocumentsFolderPage({
    params,
}: {
    params: Promise<{ folderId?: string[] }>;
}) {
    const { folderId: segments } = await params;

    if (segments && (segments.length > 1 || !UUID_PATTERN.test(segments[0]))) {
        notFound();
    }
    const folderId = segments?.[0] ?? null;

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
            <FolderContents folderId={folderId} />
        </div>
    );
}
