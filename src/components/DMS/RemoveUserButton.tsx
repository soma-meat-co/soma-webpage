"use client";

import { useState, useTransition } from "react";
import { Trash2, UserX } from "lucide-react";

import { removeUser } from "@/app/DMS/admin/user-management/userManagement.actions";
import { DmsDialog, DmsDialogNote } from "@/components/DMS/DmsDialog";
import { Button } from "@/components/ui/button";
import type { ManagedUser } from "@/lib/core/admin/provider/admin.provider";
import { useUser } from "@/lib/core/context/userContext";

/**
 * Botón "Eliminar" de un usuario, con un diálogo de confirmación
 * ({@link DmsDialog}). No se muestra en la fila de quien tiene la sesión:
 * nadie puede eliminarse a sí mismo. Esconderlo es solo presentación;
 * `remove_user` lo rechaza en la base.
 *
 * @param user - usuario a eliminar
 * @returns el botón y su diálogo, o `null` en la fila propia
 * @example
 * <RemoveUserButton user={user} />
 */
export function RemoveUserButton({ user }: { user: ManagedUser }) {
    const { user: currentUser } = useUser();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (currentUser?.email === user.email) return null;

    /**
     * Abre o cierra el diálogo. Al abrir, limpia el error anterior.
     *
     * @param nextOpen - `true` para abrir
     * @example
     * <DmsDialog onOpenChange={handleOpenChange} />
     */
    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen) setErrorMessage(null);
        setOpen(nextOpen);
    }

    /**
     * Elimina al usuario y cierra el diálogo, o muestra el error.
     *
     * @example
     * <DmsDialog onSubmit={handleSubmit} />
     */
    function handleSubmit() {
        setErrorMessage(null);
        startTransition(async () => {
            const result = await removeUser(user.id);
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
                    aria-label={`Eliminar usuario ${user.email}`}
                    className="h-11 flex-1 border-soma-gray px-4 text-soma-red shadow-soma hover:bg-soma-red/5 hover:text-soma-red md:h-9 md:flex-none"
                >
                    <Trash2 aria-hidden />
                    Eliminar
                </Button>
            }
            icon={UserX}
            eyebrow="Eliminar usuario"
            title={user.email}
            onSubmit={handleSubmit}
            submitLabel="Eliminar usuario"
            pendingLabel="Eliminando..."
            isPending={isPending}
            errorMessage={errorMessage}
        >
            <p className="text-base leading-relaxed text-soma-black">
                Se eliminará la cuenta de <span className="font-semibold">{user.email}</span> y ya no podrá entrar al DMS.
                Esta acción no se puede deshacer.
            </p>
            <DmsDialogNote>
                Si el usuario subió documentos o creó carpetas o áreas, no se puede eliminar.
            </DmsDialogNote>
        </DmsDialog>
    );
}
