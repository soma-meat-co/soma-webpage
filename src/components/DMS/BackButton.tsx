"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

// Destino cuando no hay página anterior en esta pestaña (ej. se abrió un link directo).
const FALLBACK_ROUTE = "/DMS";

/**
 * Botón "Volver". Sin `href`, regresa a la página anterior del historial del
 * navegador; si la pestaña no tiene historial previo (link directo o pestaña
 * nueva), `router.back()` no haría nada o saldría del sitio, así que lleva a
 * `/DMS`. Con `href`, siempre va a esa ruta (ej. el explorador de carpetas,
 * donde el historial regresaría carpeta por carpeta).
 *
 * @param href - destino fijo; si no viene, usa el historial
 * @returns el botón de volver
 * @example
 * <BackButton />
 * <BackButton href="/DMS" />
 */
export function BackButton({ href }: { href?: string }) {
    const router = useRouter();

    /**
     * Va a `href` si viene; si no, regresa una página en el historial, o va
     * al inicio del DMS si no hay a dónde regresar.
     *
     * @returns nada
     * @example
     * <Button onClick={handleBack}>Volver</Button>
     */
    const handleBack = (): void => {
        if (href) {
            router.push(href);
            return;
        }
        if (window.history.length > 1) {
            router.back();
            return;
        }
        router.push(FALLBACK_ROUTE);
    };

    return (
        <Button
            variant="ghost"
            onClick={handleBack}
            className="h-11 px-2 text-soma-brown md:h-9"
        >
            <ArrowLeft aria-hidden />
            Volver
        </Button>
    );
}
