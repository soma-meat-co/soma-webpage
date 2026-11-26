/**
 * Placeholder de {@link DocumentRow} mientras cargan los datos. Copia su
 * estructura (nombre, tags y fecha a la izquierda; acciones a la derecha desde
 * `md`) para que la página no salte cuando llega el contenido real.
 * Es decorativo: va con `aria-hidden` y el aviso de carga lo da el contenedor.
 *
 * @returns la fila placeholder
 * @example
 * <ul>
 *     <DocumentRowSkeleton />
 * </ul>
 */
export function DocumentRowSkeleton() {
    return (
        <li aria-hidden className="flex animate-pulse flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-2">
                {/* nombre */}
                <div className="h-4 w-48 rounded bg-soma-gray-lt" />
                <div className="flex items-center gap-2">
                    {/* tag */}
                    <div className="h-5 w-16 rounded-full bg-soma-gray-lt" />
                    {/* fecha */}
                    <div className="h-3 w-20 rounded bg-soma-gray-lt" />
                </div>
            </div>
            {/* acciones: Ver y Descargar */}
            <div className="flex gap-2 md:shrink-0">
                <div className="h-9 flex-1 rounded-md bg-soma-gray-lt md:w-20 md:flex-none" />
                <div className="h-9 flex-1 rounded-md bg-soma-gray-lt md:w-28 md:flex-none" />
            </div>
        </li>
    );
}
