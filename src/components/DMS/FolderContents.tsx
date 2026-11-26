import Link from "next/link";
import { notFound } from "next/navigation";
import { CornerLeftUp, FolderOpen } from "lucide-react";

import { foldersProvider } from "@/lib/core/folders/service/folders.service";
import type { Folder, FolderDocument, FolderPathItem } from "@/lib/core/folders/provider/folders.provider";
import { handleError } from "@/lib/errors/handleError";
import { CreateFolderButton } from "@/components/DMS/CreateFolderButton";
import { DocumentRow } from "@/components/DMS/DocumentRow";
import { DocumentSearch } from "@/components/DMS/DocumentSearch";
import { FolderBreadcrumbs } from "@/components/DMS/FolderBreadcrumbs";
import { FolderRow } from "@/components/DMS/FolderRow";

interface FolderContentsProps {
    /** Carpeta a mostrar, o `null` para la raíz ("Documentos"). */
    folderId: string | null;
    /** Oculta el encabezado "Documentos" con el breadcrumb (ej. en el inicio `/DMS`). */
    hideHeader?: boolean;
}

/**
 * Contenido de una carpeta: encabezado con breadcrumb, búsqueda, link
 * "Regresar a …", nombre de la carpeta con `CreateFolderButton` y la lista
 * (subcarpetas primero, luego documentos). Server Component: consulta
 * `getFolderElements` por su cuenta.
 *
 * Lo usan la página de carpetas (`/DMS/documents/[[...folderId]]`) y el
 * inicio del DMS para usuarios no admin (raíz, con `hideHeader`). Las
 * carpetas enlazan a `/DMS/documents/<id>`.
 *
 * Responde 404 (`notFound()`) si `folderId` no existe. Un error de la
 * consulta se muestra en lugar de la lista.
 *
 * @param folderId - carpeta a mostrar, o `null` para la raíz
 * @param hideHeader - `true` para ocultar el encabezado "Documentos"; por defecto `false`
 * @returns el contenido de la carpeta
 * @example
 * <FolderContents folderId={null} hideHeader />
 */
export async function FolderContents({ folderId, hideHeader = false }: FolderContentsProps) {
    let path: FolderPathItem[] = [];
    let folders: Folder[] = [];
    let documents: FolderDocument[] = [];
    let errorMessage: string | null = null;

    try {
        ({ path, folders, documents } = await foldersProvider.getFolderElements(folderId));
    } catch (err) {
        errorMessage = handleError("FolderContents", err).message;
    }

    // Una carpeta que existe siempre trae al menos a sí misma en `path`.
    // `notFound()` va fuera del try: funciona lanzando un error especial.
    if (folderId && !errorMessage && path.length === 0) {
        notFound();
    }

    const currentName = path.at(-1)?.folder_name ?? "Documentos";
    // El penúltimo paso es la carpeta padre; si no hay, el padre es la raíz.
    const parent = path.at(-2);
    const parentHref = parent ? `/DMS/documents/${parent.id}` : "/DMS/documents";
    const parentName = parent?.folder_name ?? "Documentos";
    const isEmpty = folders.length === 0 && documents.length === 0;

    return (
        <div className="space-y-8">
            {!hideHeader && (
                <header className="space-y-1">
                    <h1 className="text-2xl font-semibold text-soma-brown">Documentos</h1>
                    <FolderBreadcrumbs path={path} />
                </header>
            )}

            <DocumentSearch />

            {errorMessage ? (
                <p role="alert" className="rounded-md bg-soma-red/10 px-3 py-2 text-sm text-soma-red">
                    {errorMessage}
                </p>
            ) : (
                <section aria-label={`Contenido de ${currentName}`} className="space-y-3">
                    {folderId && (
                        <Link
                            href={parentHref}
                            className="inline-flex items-center gap-1.5 text-xs text-soma-brown/70 transition-colors hover:text-soma-red"
                        >
                            <CornerLeftUp size={14} aria-hidden />
                            Regresar a {parentName}
                        </Link>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <FolderOpen size={20} aria-hidden className="shrink-0 text-soma-brown/70" />
                            <h2 className="truncate text-base font-semibold text-soma-brown">{currentName}</h2>
                        </div>
                        {/* Solo admin; la nueva carpeta se crea dentro de la que se está viendo. */}
                        <CreateFolderButton parentId={folderId} parentName={currentName} />
                    </div>

                    {/* Sangría con línea guía: el contenido cuelga de la carpeta actual. */}
                    <div className="ml-2.5 border-l-2 border-soma-gray-lt pl-4 md:pl-6">
                        {isEmpty ? (
                            <p className="py-6 text-sm text-soma-gray">Esta carpeta está vacía.</p>
                        ) : (
                            <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                                {folders.map((folder) => (
                                    <FolderRow key={folder.id} folder={folder} />
                                ))}
                                {documents.map((document) => (
                                    <DocumentRow key={document.id} document={document} />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
