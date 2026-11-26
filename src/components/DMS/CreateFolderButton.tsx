"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";

import { createFolder } from "@/app/DMS/admin/folders/folders.actions";
import { DMS_DIALOG_CONTROL, DmsDialog, DmsDialogField, DmsDialogNote } from "@/components/DMS/DmsDialog";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/core/auth/roles";
import { useUser } from "@/lib/core/context/userContext";

interface CreateFolderButtonProps {
    /** Carpeta donde se crea la nueva (la que se está viendo), o `null` en la raíz. */
    parentId: string | null;
    /** Nombre de la carpeta actual, para el texto del diálogo. */
    parentName: string;
}

/**
 * Botón "Nueva carpeta" con su diálogo ({@link DmsDialog}). Solo se muestra a
 * admins; la carpeta se crea dentro de la que se está viendo.
 *
 * Esconderlo es solo presentación: RLS (`is_admin()`) rechaza el insert si
 * alguien llama `createFolder` sin ser admin. Al guardar, la action limpia el
 * Router Cache y la página se vuelve a pintar con la carpeta nueva.
 *
 * @param parentId - carpeta padre, o `null` para la raíz
 * @param parentName - nombre de la carpeta padre
 * @returns el botón, o `null` si el usuario no es admin
 * @example
 * <CreateFolderButton parentId={folderId} parentName={currentName} />
 */
export function CreateFolderButton({ parentId, parentName }: CreateFolderButtonProps) {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!user || !isAdminRole(user.role)) return null;

    const nameId = `new-folder-${parentId ?? "root"}`;

    /**
     * Abre o cierra el diálogo. Al abrir, empieza con el formulario vacío.
     *
     * @param nextOpen - `true` para abrir
     * @example
     * <DmsDialog onOpenChange={handleOpenChange} />
     */
    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) {
            setFolderName("");
            setErrorMessage(null);
        }
        setOpen(nextOpen);
    }

    /**
     * Crea la carpeta y cierra el diálogo, o muestra el error.
     *
     * @example
     * <DmsDialog onSubmit={handleSubmit} />
     */
    function handleSubmit() {
        setErrorMessage(null);
        startTransition(async () => {
            const result = await createFolder(folderName, parentId);
            if (!result.ok) {
                setErrorMessage(result.message);
                return;
            }
            setOpen(false);
        });
    }

    return (
        <DmsDialog
            open={open}
            onOpenChange={handleOpenChange}
            trigger={
                <Button
                    variant="outline"
                    className="h-11 border-soma-gray px-4 text-soma-brown shadow-soma md:h-9"
                >
                    <FolderPlus aria-hidden />
                    Nueva carpeta
                </Button>
            }
            icon={FolderPlus}
            eyebrow="Nueva carpeta"
            title={`Dentro de ${parentName}`}
            onSubmit={handleSubmit}
            submitLabel="Crear carpeta"
            pendingLabel="Creando..."
            isPending={isPending}
            errorMessage={errorMessage}
        >
            <DmsDialogField label="Nombre" htmlFor={nameId}>
                <input
                    id={nameId}
                    value={folderName}
                    onChange={(event) => setFolderName(event.target.value)}
                    required
                    autoFocus
                    maxLength={120}
                    placeholder="Ej. Auditorías 2026"
                    className={DMS_DIALOG_CONTROL}
                />
            </DmsDialogField>

            <DmsDialogNote>
                {/* La raíz no tiene áreas: ahí no hay nada que heredar. */}
                {parentId ? `Hereda las áreas de ${parentName}. ` : ""}
                Para agregarle áreas propias, usa &quot;Editar&quot; después de crearla.
            </DmsDialogNote>
        </DmsDialog>
    );
}
