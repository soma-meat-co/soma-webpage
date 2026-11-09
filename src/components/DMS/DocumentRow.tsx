import { Download, Eye } from "lucide-react";

import { ComingSoonButton } from "@/components/DMS/ComingSoonButton";
import { DmsBadge } from "@/components/DMS/DmsBadge";

export interface DocumentSummary {
    id: string;
    name: string;
    tags: string[];
    updatedAt: string;
}

/**
 * Fila de un documento: nombre, tags, fecha y acciones. En mobile las acciones
 * van debajo de los datos; desde `md` van a la derecha.
 *
 * @param document - documento a mostrar
 * @returns la fila del documento
 * @example
 * <DocumentRow document={documento} />
 */
export function DocumentRow({ document }: { document: DocumentSummary }) {
    return (
        <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1.5">
                <p className="truncate text-sm font-semibold text-soma-brown">{document.name}</p>
                <div className="flex flex-wrap items-center gap-2">
                    {document.tags.map((tag) => (
                        <DmsBadge key={tag}>{tag}</DmsBadge>
                    ))}
                    <span className="text-xs text-soma-brown/70">{document.updatedAt}</span>
                </div>
            </div>
            <div className="flex gap-2 md:shrink-0">
                <ComingSoonButton label="Ver" icon={Eye} className="flex-1 md:flex-none" />
                <ComingSoonButton label="Descargar" icon={Download} className="flex-1 md:flex-none" />
            </div>
        </li>
    );
}
