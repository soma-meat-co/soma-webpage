import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { FolderPathItem } from "@/lib/core/folders/provider/folders.provider";

/**
 * Ruta de la carpeta actual en texto pequeño: Documentos › Calidad › Auditorías.
 * Cada paso es un `<Link>` menos el último, que es la carpeta actual.
 * En la raíz (`path` vacío) solo muestra "Documentos".
 *
 * @param path - carpeta actual y ancestros, de la raíz hacia abajo
 *   (`FolderElements.path`)
 * @returns el breadcrumb
 * @example
 * <FolderBreadcrumbs path={path} />
 */
export function FolderBreadcrumbs({ path }: { path: FolderPathItem[] }) {
    const linkClass = "hover:text-soma-red transition-colors";

    return (
        <nav aria-label="Ruta de la carpeta">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-soma-brown/70">
                <li>
                    {path.length === 0 ? (
                        <span aria-current="page" className="font-semibold text-soma-brown">Documentos</span>
                    ) : (
                        <Link href="/DMS/documents" className={linkClass}>Documentos</Link>
                    )}
                </li>
                {path.map((step, index) => {
                    const isCurrent = index === path.length - 1;
                    return (
                        <li key={step.id} className="flex items-center gap-1">
                            <ChevronRight size={12} aria-hidden className="text-soma-brown/40" />
                            {isCurrent ? (
                                <span aria-current="page" className="font-semibold text-soma-brown">
                                    {step.folder_name}
                                </span>
                            ) : (
                                <Link href={`/DMS/documents/${step.id}`} className={linkClass}>
                                    {step.folder_name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
