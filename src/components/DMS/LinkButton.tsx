import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkButtonProps {
    href: string;
    label: string;
    icon: LucideIcon;
    primary?: boolean;
    className?: string;
}

/**
 * Enlace con el mismo aspecto que `ComingSoonButton`, para las acciones que ya
 * llevan a una ruta.
 *
 * @param href - ruta de destino
 * @param label - texto del botón
 * @param icon - icono de `lucide-react`
 * @param primary - `true` para mostrarlo como la acción principal
 * @param className - clases para el enlace, por ejemplo su ancho
 * @returns el enlace con estilo de botón
 * @example
 * <LinkButton href="/DMS/admin/user-management" label="Usuarios" icon={Users} />
 */
export function LinkButton({ href, label, icon: Icon, primary = false, className }: LinkButtonProps) {
    return (
        <Button
            asChild
            variant={primary ? "default" : "outline"}
            className={cn(
                "h-11 w-full px-4 shadow-soma md:h-9",
                primary ? "bg-soma-red text-white" : "border-soma-gray text-soma-brown",
                className,
            )}
        >
            <Link href={href}>
                <Icon aria-hidden />
                {label}
            </Link>
        </Button>
    );
}
