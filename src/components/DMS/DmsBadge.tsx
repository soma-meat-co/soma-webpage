/**
 * Etiqueta corta para roles, tags y avisos.
 *
 * @param children - texto de la etiqueta
 * @returns la etiqueta
 * @example
 * <DmsBadge>Calidad</DmsBadge>
 */
export function DmsBadge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-sm bg-soma-brown/10 px-2 py-0.5 text-xs font-semibold text-soma-brown">
            {children}
        </span>
    );
}
