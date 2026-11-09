import { DmsBadge } from "@/components/DMS/DmsBadge";
import { DmsSection } from "@/components/DMS/DmsSection";
import { DocumentRow, type DocumentSummary } from "@/components/DMS/DocumentRow";

/**
 * Lista de documentos recientes. Recibe los documentos por props para poder
 * cambiar los datos de ejemplo por los reales sin modificar este componente.
 *
 * @param documents - documentos a mostrar
 * @returns la sección de documentos recientes
 * @example
 * <RecentDocuments documents={documentos} />
 */
export function RecentDocuments({ documents }: { documents: DocumentSummary[] }) {
    return (
        <DmsSection title="Documentos recientes" aside={<DmsBadge>Datos de ejemplo</DmsBadge>}>
            <ul className="divide-y divide-soma-gray-lt rounded-lg border border-soma-gray-lt bg-white shadow-soma">
                {documents.map((document) => (
                    <DocumentRow key={document.id} document={document} />
                ))}
            </ul>
        </DmsSection>
    );
}
