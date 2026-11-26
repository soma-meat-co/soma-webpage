"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Pencil, Tag, UserPen } from "lucide-react";

import { editUserData } from "@/app/DMS/admin/user-management/userManagement.actions";
import { DMS_DIALOG_CONTROL, DmsDialog, DmsDialogField, DmsDialogNote } from "@/components/DMS/DmsDialog";
import { Button } from "@/components/ui/button";
import type { ManagedUser } from "@/lib/core/admin/provider/admin.provider";
import type { Area } from "@/lib/core/areas/provider/areas.provider";
import { cn } from "@/lib/utils";

/** Valor del `<select>` para "Sin área" (un `<option>` no puede valer `null`). */
const NO_AREA_VALUE = "";

interface EditUserButtonProps {
    /** Usuario a editar. */
    user: ManagedUser;
    /** Áreas para el selector. */
    areas: Area[];
}

/**
 * Botón "Editar" de un usuario, con su diálogo ({@link DmsDialog}). Cambia el
 * nombre, los apellidos y el área. Los usuarios invitados llegan sin área: se
 * les asigna aquí.
 *
 * La página ya es solo para admins (proxy) y `edit_user_data` rechaza en la
 * base a quien no lo es.
 *
 * @param user - usuario a editar
 * @param areas - áreas disponibles
 * @returns el botón y su diálogo
 * @example
 * <EditUserButton user={user} areas={areas} />
 */
export function EditUserButton({ user, areas }: EditUserButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [nombre, setNombre] = useState(user.nombre ?? "");
    const [apellidoPaterno, setApellidoPaterno] = useState(user.apellidoPaterno ?? "");
    const [apellidoMaterno, setApellidoMaterno] = useState(user.apellidoMaterno ?? "");
    const [areaValue, setAreaValue] = useState(user.areaId ?? NO_AREA_VALUE);

    const idPrefix = `edit-user-${user.id}`;

    /**
     * Abre o cierra el diálogo. Al abrir, carga los datos actuales del usuario.
     *
     * @param nextOpen - `true` para abrir
     * @example
     * <DmsDialog onOpenChange={handleOpenChange} />
     */
    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) {
            setNombre(user.nombre ?? "");
            setApellidoPaterno(user.apellidoPaterno ?? "");
            setApellidoMaterno(user.apellidoMaterno ?? "");
            setAreaValue(user.areaId ?? NO_AREA_VALUE);
            setErrorMessage(null);
        }
        setOpen(nextOpen);
    }

    /**
     * Guarda los cambios y cierra el diálogo, o muestra el error.
     *
     * @example
     * <DmsDialog onSubmit={handleSubmit} />
     */
    function handleSubmit() {
        setErrorMessage(null);
        startTransition(async () => {
            const result = await editUserData(user.id, {
                nombre,
                apellidoPaterno,
                apellidoMaterno: apellidoMaterno || null,
                areaId: areaValue === NO_AREA_VALUE ? null : areaValue,
            });
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
                    aria-label={`Editar usuario ${user.email}`}
                    className="h-11 flex-1 border-soma-gray px-4 text-soma-brown shadow-soma md:h-9 md:flex-none"
                >
                    <Pencil aria-hidden />
                    Editar
                </Button>
            }
            icon={UserPen}
            eyebrow="Editar usuario"
            title={user.email}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
            pendingLabel="Guardando..."
            isPending={isPending}
            errorMessage={errorMessage}
        >
            <DmsDialogField label="Nombre" htmlFor={`${idPrefix}-nombre`}>
                <input
                    id={`${idPrefix}-nombre`}
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    required
                    maxLength={100}
                    className={DMS_DIALOG_CONTROL}
                />
            </DmsDialogField>

            <div className="grid gap-6 sm:grid-cols-2">
                <DmsDialogField label="Apellido paterno" htmlFor={`${idPrefix}-paterno`}>
                    <input
                        id={`${idPrefix}-paterno`}
                        value={apellidoPaterno}
                        onChange={(event) => setApellidoPaterno(event.target.value)}
                        required
                        maxLength={100}
                        className={DMS_DIALOG_CONTROL}
                    />
                </DmsDialogField>
                <DmsDialogField label="Apellido materno" htmlFor={`${idPrefix}-materno`}>
                    <input
                        id={`${idPrefix}-materno`}
                        value={apellidoMaterno}
                        onChange={(event) => setApellidoMaterno(event.target.value)}
                        maxLength={100}
                        placeholder="Opcional"
                        className={DMS_DIALOG_CONTROL}
                    />
                </DmsDialogField>
            </div>

            <DmsDialogField label="Área" htmlFor={`${idPrefix}-area`}>
                <div className="relative">
                    <Tag
                        size={20}
                        strokeWidth={1.8}
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-soma-taupe-lt"
                    />
                    <select
                        id={`${idPrefix}-area`}
                        value={areaValue}
                        onChange={(event) => setAreaValue(event.target.value)}
                        className={cn(DMS_DIALOG_CONTROL, "cursor-pointer appearance-none pr-10 pl-11")}
                    >
                        <option value={NO_AREA_VALUE}>Sin área</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.name}
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
                <DmsDialogNote>
                    Los usuarios nuevos se crean sin área: asígnala aquí después de invitarlos.
                </DmsDialogNote>
            </DmsDialogField>
        </DmsDialog>
    );
}
