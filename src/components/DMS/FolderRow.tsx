import Link from "next/link";
import { ChevronRight, Folder as FolderIcon } from "lucide-react";

import { DmsBadge } from "@/components/DMS/DmsBadge";
import { EditItemButton } from "@/components/DMS/EditItemButton";
import type { Folder } from "@/lib/core/folders/provider/folders.provider";

/**
 * Fila de una subcarpeta: ícono, nombre y tags (áreas propias y heredadas).
 * El nombre y los tags son un `<Link>` a `/DMS/documents/<id>`, así que
 * navegar usa el Router Cache de Next y la carpeta se precarga al entrar en
 * pantalla. "Editar" (solo admin) va fuera del link: un botón dentro de un
 * `<a>` no es HTML válido. Va dentro de la misma `<ul>` que {@link DocumentRow}.
 *
 * @param folder - carpeta a mostrar
 * @returns la fila de la carpeta
 * @example
 * <FolderRow key={folder.id} folder={folder} />
 */
export function FolderRow({ folder }: { folder: Folder }) {
    return (
        <li className="flex items-center gap-2 pr-4">
            <Link
                href={`/DMS/documents/${folder.id}`}
                className="flex min-w-0 flex-1 items-center gap-3 p-4 transition-colors hover:bg-soma-gray-lt/40 focus-visible:bg-soma-gray-lt/40 focus-visible:outline-none"
            >
                <FolderIcon size={20} aria-hidden className="shrink-0 text-soma-brown/70" />
                <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="truncate text-sm font-semibold text-soma-brown">{folder.folder_name}</p>
                    {folder.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {folder.tags.map((tag) => (
                                <DmsBadge key={tag}>{tag}</DmsBadge>
                            ))}
                        </div>
                    )}
                </div>
                <ChevronRight size={16} aria-hidden className="shrink-0 text-soma-brown/50" />
            </Link>
            <EditItemButton
                target={{ kind: "folder", id: folder.id }}
                name={folder.folder_name}
                currentFolderId={folder.parent_id}
            />
        </li>
    );
}
