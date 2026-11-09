interface DmsSectionProps {
    title: string;
    aside?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Sección de una página del DMS, con título y contenido.
 *
 * @param title - título de la sección
 * @param aside - contenido opcional junto al título
 * @param children - contenido de la sección
 * @returns la sección
 * @example
 * <DmsSection title="Administración">...</DmsSection>
 */
export function DmsSection({ title, aside, children }: DmsSectionProps) {
    return (
        <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-soma-brown">{title}</h2>
                {aside}
            </div>
            {children}
        </section>
    );
}
