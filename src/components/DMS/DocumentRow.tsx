import { DmsBadge } from "@/components/DMS/DmsBadge";
import { DownloadDocumentButton } from "@/components/DMS/DownloadDocumentButton";
import { EditItemButton } from "@/components/DMS/EditItemButton";
import { OpenDocumentButton } from "@/components/DMS/OpenDocumentButton";
import type { FolderDocument } from "@/lib/core/folders/provider/folders.provider";

/**
 * Formato de fecha de las filas (ej. "12 oct 2026"). La zona horaria es fija
 * para que servidor y navegador pinten la misma fecha y no haya error de
 * hidratación.
 */
const DATE_FORMAT = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Mexico_City",
});

/**
 * Fila de un documento: nombre, tags (áreas propias y heredadas), fecha de
 * subida y acciones ("Ver"; "Descargar" y "Editar" solo admin). Recibe el documento tal como lo regresa
 * `getFolderElements`. En mobile las acciones van debajo de los datos; desde
 * `md` van a la derecha.
 *
 * @param document - documento a mostrar
 * @returns la fila del documento
 * @example
 * <DocumentRow document={document} />
 */
export function DocumentRow({ document }: { document: FolderDocument }) {
    return (
        <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5">
                <p className="truncate text-sm font-semibold text-soma-brown">{document.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                    {document.tags.map((tag) => (
                        <DmsBadge key={tag}>{tag}</DmsBadge>
                    ))}
                    {document.uploaded_at && (
                        <span className="text-xs text-soma-brown/70">
                            {DATE_FORMAT.format(new Date(document.uploaded_at))}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-start gap-2 md:shrink-0">
                <OpenDocumentButton documentId={document.id} className="flex-1 md:flex-none" />
                <DownloadDocumentButton documentId={document.id} className="flex-1 md:flex-none" />
                <EditItemButton
                    target={{ kind: "document", id: document.id }}
                    name={document.name}
                    currentFolderId={document.folder_id}
                />
            </div>
        </li>
    );
}
