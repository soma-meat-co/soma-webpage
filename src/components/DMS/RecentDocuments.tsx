import { DmsSection } from "@/components/DMS/DmsSection";
import { DocumentRow } from "@/components/DMS/DocumentRow";
import type { FolderDocument } from "@/lib/core/folders/provider/folders.provider";

interface RecentDocumentsProps {
    /** Documentos abiertos recientemente, el más reciente primero. */
    documents: FolderDocument[];
    /** Mensaje para el usuario si no se pudieron leer; reemplaza la lista. */
    errorMessage?: string | null;
}

/**
 * Lista de documentos abiertos recientemente en este navegador.
 *
 * @param documents - documentos a mostrar
 * @param errorMessage - error al leer los recientes, si lo hubo
 * @returns la sección de documentos recientes
 * @example
 * <RecentDocuments documents={documentos} errorMessage={null} />
 */
export function RecentDocuments({ documents, errorMessage }: RecentDocumentsProps) {
    return (
        <DmsSection title="Documentos recientes">
            {errorMessage ? (
                <p role="alert" className="rounded-md bg-soma-red/10 px-3 py-2 text-sm text-soma-red">
                    {errorMessage}
                </p>
            ) : documents.length === 0 ? (
                <p className="py-6 text-sm text-soma-gray">Aún no has abierto documentos.</p>
            ) : (
                <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                    {documents.map((document) => (
                        <DocumentRow key={document.id} document={document} />
                    ))}
                </ul>
            )}
        </DmsSection>
    );
}
