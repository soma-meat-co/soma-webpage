import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComingSoonButtonProps {
    label: string;
    icon: LucideIcon;
    primary?: boolean;
    className?: string;
}

/**
 * Botón deshabilitado para una acción que aún no tiene funcionalidad. El
 * tooltip va en un `span` porque un botón deshabilitado no recibe el puntero.
 *
 * @param label - texto del botón
 * @param icon - icono de `lucide-react`
 * @param primary - `true` para mostrarlo como la acción principal
 * @param className - clases para el contenedor, por ejemplo su ancho
 * @returns el botón deshabilitado
 * @example
 * <ComingSoonButton label="Ver" icon={Eye} />
 */
export function ComingSoonButton({
    label,
    icon: Icon,
    primary = false,
    className,
}: ComingSoonButtonProps) {
    return (
        <span title="Próximamente" className={cn("block", className)}>
            <Button
                disabled
                variant={primary ? "default" : "outline"}
                className={cn(
                    "h-11 w-full px-4 shadow-soma disabled:opacity-70 md:h-9",
                    primary ? "bg-soma-red text-white" : "border-soma-gray text-soma-brown",
                )}
            >
                <Icon aria-hidden />
                {label}
            </Button>
        </span>
    );
}
