import { DocumentRowSkeleton } from "@/components/DMS/DocumentRowSkeleton";
import { DocumentSearch } from "@/components/DMS/DocumentSearch";

/** Filas placeholder que se muestran mientras carga una carpeta. */
const SKELETON_ROWS = 5;

/**
 * Estado de carga de la navegación de carpetas. Next lo muestra en cuanto el
 * usuario entra a la ruta y lo reemplaza por `page.tsx` cuando termina su
 * `await`. Repite el layout de la página (encabezado, buscador, lista) para
 * que el cambio no mueva nada en pantalla.
 *
 * @returns el esqueleto de la página de carpetas
 * @example
 * // Next lo usa solo; no se importa en ningún lado.
 */
export default function DocumentsFolderLoading() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 md:px-8 md:py-10">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold text-soma-brown">Documentos</h1>
                {/* breadcrumb */}
                <div aria-hidden className="h-4 w-40 animate-pulse rounded bg-soma-gray-lt" />
            </header>

            <DocumentSearch />

            <div role="status" aria-label="Cargando carpeta" className="space-y-3">
                {/* nombre de la carpeta actual */}
                <div aria-hidden className="flex animate-pulse items-center gap-2">
                    <div className="size-5 rounded bg-soma-gray-lt" />
                    <div className="h-5 w-36 rounded bg-soma-gray-lt" />
                </div>

                {/* misma sangría que page.tsx */}
                <div className="ml-2.5 border-l-2 border-soma-gray-lt pl-4 md:pl-6">
                    <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                            <DocumentRowSkeleton key={index} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
