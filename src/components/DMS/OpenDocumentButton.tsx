"use client";

import { useState, useTransition } from "react";
import { Eye } from "lucide-react";

import { openDocument } from "@/app/DMS/documents/documents.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OpenDocumentButtonProps {
    documentId: string;
    className?: string;
}

/**
 * Botón "Ver": pide al servidor una URL firmada del documento y lo abre en
 * una pestaña nueva.
 *
 * La pestaña se abre en blanco **antes** de llamar al servidor: los
 * navegadores bloquean `window.open` si no ocurre directo en el clic, y
 * después de un `await` ya no cuenta como clic. Cuando llega la URL se carga
 * en esa pestaña; si hay error, se cierra y el mensaje se muestra bajo el botón.
 *
 * @param documentId - id del documento
 * @param className - clases para el contenedor, por ejemplo su ancho
 * @returns el botón con su mensaje de error, si lo hay
 * @example
 * <OpenDocumentButton documentId={document.id} />
 */
export function OpenDocumentButton({ documentId, className }: OpenDocumentButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    /**
     * Abre la pestaña, pide la URL firmada y la carga, o cierra la pestaña y
     * guarda el error.
     *
     * @example
     * <Button onClick={handleOpen} />
     */
    function handleOpen() {
        setErrorMessage(null);
        const newTab = window.open("about:blank", "_blank");
        // La pestaña nueva no debe poder controlar esta (equivale a noopener).
        if (newTab) newTab.opener = null;

        startTransition(async () => {
            const result = await openDocument(documentId);
            if (!result.ok) {
                newTab?.close();
                setErrorMessage(result.message);
                return;
            }
            if (newTab) {
                newTab.location.href = result.url;
            } else {
                // El navegador bloqueó la pestaña: se abre en esta.
                window.location.href = result.url;
            }
        });
    }

    return (
        <span className={cn("block", className)}>
            <Button
                variant="outline"
                onClick={handleOpen}
                disabled={isPending}
                aria-busy={isPending}
                className="h-11 w-full border-soma-gray px-4 text-soma-brown shadow-soma md:h-9"
            >
                <Eye aria-hidden />
                {isPending ? "Abriendo..." : "Ver"}
            </Button>
            {errorMessage && (
                <span role="alert" className="mt-1 block text-xs text-soma-red">
                    {errorMessage}
                </span>
            )}
        </span>
    );
}
