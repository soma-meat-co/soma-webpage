"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, FileText, Folder as FolderIcon, Loader2, Pencil } from "lucide-react";

import {
    getEditOptions,
    updateDocument,
    updateFolder,
    type EditTarget,
    type FolderDestination,
} from "@/app/DMS/admin/folders/folders.actions";
import { DMS_DIALOG_CONTROL, DmsDialog, DmsDialogField, DmsDialogNote } from "@/components/DMS/DmsDialog";
import { Button } from "@/components/ui/button";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { isAdminRole } from "@/lib/core/auth/roles";
import { useUser } from "@/lib/core/context/userContext";
import { cn } from "@/lib/utils";

/** Valor del `<select>` para la raíz (un `<option>` no puede valer `null`). */
const ROOT_VALUE = "";

interface EditItemButtonProps {
    /** `folder` o `document`, y su id. */
    target: EditTarget;
    /** Nombre actual. */
    name: string;
    /** Carpeta donde está hoy (`parent_id` o `folder_id`), o `null` si está en la raíz. */
    currentFolderId: string | null;
}

/**
 * Botón "Editar" de una carpeta o un documento, con su diálogo
 * ({@link DmsDialog}). Solo se muestra a admins. En el diálogo se cambian el
 * nombre, la ubicación (todas las carpetas, con su ruta) y las áreas propias
 * (tags). Las áreas heredadas de las carpetas de arriba no aparecen marcadas:
 * se cambian editando esas carpetas.
 *
 * Las opciones se piden al abrir el diálogo. Esconder el botón es solo
 * presentación: `update_folder()` / `update_document()` rechazan en la base a
 * quien no es admin. Todo se guarda en una sola transacción.
 *
 * @param target - qué se edita y su id
 * @param name - nombre actual
 * @param currentFolderId - carpeta actual, o `null` para la raíz
 * @returns el botón, o `null` si el usuario no es admin
 * @example
 * <EditItemButton target={{ kind: "folder", id: folder.id }} name={folder.folder_name} currentFolderId={folder.parent_id} />
 */
export function EditItemButton({ target, name, currentFolderId }: EditItemButtonProps) {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [destinations, setDestinations] = useState<FolderDestination[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);
    const [newName, setNewName] = useState(name);
    const [destinationValue, setDestinationValue] = useState(currentFolderId ?? ROOT_VALUE);
    const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);

    if (!user || !isAdminRole(user.role)) return null;

    const isFolder = target.kind === "folder";
    const kindLabel = isFolder ? "carpeta" : "documento";
    const nameId = `edit-${target.id}-name`;
    const locationId = `edit-${target.id}-location`;

    /**
     * Al abrir, reinicia el formulario con los valores actuales y pide las
     * carpetas destino, las áreas y las áreas propias del elemento.
     *
     * @param nextOpen - `true` para abrir
     * @example
     * <DmsDialog onOpenChange={handleOpenChange} />
     */
    async function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) return;

        setNewName(name);
        setDestinationValue(currentFolderId ?? ROOT_VALUE);
        setErrorMessage(null);
        setDestinations([]);
        setIsLoading(true);

        const result = await getEditOptions(target);
        setIsLoading(false);
        if (!result.ok) {
            setErrorMessage(result.message);
            return;
        }
        setDestinations(result.destinations);
        setAreas(result.areas);
        setSelectedAreaIds(result.selectedAreaIds);
    }

    /**
     * Marca o desmarca un área.
     *
     * @param areaId - id del área
     * @example
     * <button onClick={() => toggleArea(area.id)} />
     */
    function toggleArea(areaId: string) {
        setSelectedAreaIds((current) =>
            current.includes(areaId) ? current.filter((id) => id !== areaId) : [...current, areaId],
        );
    }

    /**
     * Guarda los cambios y cierra el diálogo, o muestra el error.
     *
     * @example
     * <DmsDialog onSubmit={handleSubmit} />
     */
    function handleSubmit() {
        setErrorMessage(null);
        const destinationId = destinationValue === ROOT_VALUE ? null : destinationValue;

        startTransition(async () => {
            const result = isFolder
                ? await updateFolder(target.id, {
                    folderName: newName,
                    parentId: destinationId,
                    areaIds: selectedAreaIds,
                })
                : await updateDocument(target.id, {
                    name: newName,
                    folderId: destinationId,
                    areaIds: selectedAreaIds,
                });
            if (!result.ok) {
                setErrorMessage(result.message);
                return;
            }
            setOpen(false);
        });
    }

    const selectedCount = selectedAreaIds.length;

    return (
        <DmsDialog
            open={open}
            onOpenChange={handleOpenChange}
            trigger={
                <Button
                    variant="outline"
                    aria-label={`Editar ${kindLabel} ${name}`}
                    className="h-11 shrink-0 border-soma-gray px-3 text-soma-brown shadow-soma md:h-9"
                >
                    <Pencil aria-hidden />
                    <span className="sr-only sm:not-sr-only">Editar</span>
                </Button>
            }
            icon={isFolder ? FolderIcon : FileText}
            eyebrow={`Editar ${kindLabel}`}
            title={name}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
            pendingLabel="Guardando..."
            isPending={isPending}
            // Sin destinos = no cargaron las opciones: no hay nada válido que guardar.
            submitDisabled={isLoading || destinations.length === 0}
            errorMessage={errorMessage}
        >
            {isLoading ? (
                <p className="flex items-center justify-center gap-2 py-10 text-base text-soma-taupe">
                    <Loader2 className="size-5 animate-spin" aria-hidden />
                    Cargando...
                </p>
            ) : (
                <>
                    <DmsDialogField label="Nombre" htmlFor={nameId}>
                        <input
                            id={nameId}
                            value={newName}
                            onChange={(event) => setNewName(event.target.value)}
                            required
                            maxLength={200}
                            className={DMS_DIALOG_CONTROL}
                        />
                    </DmsDialogField>

                    <DmsDialogField label="Ubicación" htmlFor={locationId}>
                        <div className="relative">
                            <FolderIcon
                                size={20}
                                strokeWidth={1.8}
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-soma-taupe-lt"
                            />
                            <select
                                id={locationId}
                                value={destinationValue}
                                onChange={(event) => setDestinationValue(event.target.value)}
                                className={cn(DMS_DIALOG_CONTROL, "cursor-pointer appearance-none pr-10 pl-11")}
                            >
                                {destinations.map((destination) => (
                                    <option key={destination.id ?? ROOT_VALUE} value={destination.id ?? ROOT_VALUE}>
                                        {destination.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={18}
                                strokeWidth={2}
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-soma-brown"
                            />
                        </div>
                    </DmsDialogField>

                    <DmsDialogField
                        label="Áreas"
                        className="gap-2.5"
                        aside={
                            <span className="rounded-full bg-soma-red/10 px-2.5 py-0.5 text-[13px] font-semibold text-soma-red">
                                {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
                            </span>
                        }
                    >
                        {areas.length === 0 ? (
                            <p className="rounded-[10px] border border-dashed border-soma-line px-3.5 py-3 text-sm text-soma-taupe">
                                No hay áreas creadas.
                            </p>
                        ) : (
                            <div role="group" aria-label="Áreas" className="flex max-h-48 flex-wrap gap-2 overflow-y-auto p-0.5">
                                {areas.map((area) => {
                                    const selected = selectedAreaIds.includes(area.id);
                                    return (
                                        <button
                                            key={area.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => toggleArea(area.id)}
                                            className={cn(
                                                "flex h-10 items-center gap-2 rounded-full border text-[15px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-soma-red/30 focus-visible:outline-none",
                                                selected
                                                    ? "border-soma-red bg-soma-red pr-4 pl-3 text-white"
                                                    : "border-soma-line bg-white px-4 text-soma-brown hover:border-soma-red/40 hover:bg-soma-red/5",
                                            )}
                                        >
                                            {selected && <Check size={16} strokeWidth={2.4} aria-hidden />}
                                            {area.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <DmsDialogNote>
                            Las áreas heredadas de las carpetas superiores no aparecen aquí. Se cambian editando esas carpetas.
                        </DmsDialogNote>
                    </DmsDialogField>
                </>
            )}
        </DmsDialog>
    );
}
