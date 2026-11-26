"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";

import { downloadDocument } from "@/app/DMS/documents/documents.actions";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/core/auth/roles";
import { useUser } from "@/lib/core/context/userContext";
import { cn } from "@/lib/utils";

interface DownloadDocumentButtonProps {
    documentId: string;
    className?: string;
}

/**
 * Botón "Descargar". Solo se muestra a admins.
 *
 * Esconderlo es solo presentación: el permiso real lo valida
 * `downloadDocument` en la base (`can_download_documents()`) antes de firmar
 * la URL. Un usuario que llame la action a mano recibe error, no el archivo.
 *
 * La URL firmada trae `Content-Disposition: attachment`, así que cargarla en
 * la misma pestaña descarga el archivo sin salir de la página, y no hace
 * falta abrir otra pestaña.
 *
 * @param documentId - id del documento
 * @param className - clases para el contenedor, por ejemplo su ancho
 * @returns el botón, o `null` si el usuario no es admin
 * @example
 * <DownloadDocumentButton documentId={document.id} />
 */
export function DownloadDocumentButton({ documentId, className }: DownloadDocumentButtonProps) {
    const { user } = useUser();
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!user || !isAdminRole(user.role)) return null;

    /**
     * Pide la URL firmada y la carga para que el navegador descargue el
     * archivo, o guarda el error.
     *
     * @example
     * <Button onClick={handleDownload} />
     */
    function handleDownload() {
        setErrorMessage(null);
        startTransition(async () => {
            const result = await downloadDocument(documentId);
            if (!result.ok) {
                setErrorMessage(result.message);
                return;
            }
            window.location.href = result.url;
        });
    }

    return (
        <span className={cn("block", className)}>
            <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isPending}
                aria-busy={isPending}
                className="h-11 w-full border-soma-gray px-4 text-soma-brown shadow-soma md:h-9"
            >
                <Download aria-hidden />
                {isPending ? "Descargando..." : "Descargar"}
            </Button>
            {errorMessage && (
                <span role="alert" className="mt-1 block text-xs text-soma-red">
                    {errorMessage}
                </span>
            )}
        </span>
    );
}
