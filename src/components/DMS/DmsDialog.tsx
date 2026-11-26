"use client";

import type { LucideIcon } from "lucide-react";
import { Info, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Clases para inputs y selects dentro de un {@link DmsDialog}: 48px de alto,
 * borde arena y borde rojo con halo al enfocar.
 */
export const DMS_DIALOG_CONTROL =
    "h-12 w-full rounded-[10px] border border-soma-line bg-white px-3.5 text-base text-soma-black outline-none transition-[border-color,box-shadow] placeholder:text-soma-taupe-xltfocus:border-soma-red focus:ring-4 focus:ring-soma-red/10";

/** Clases de la etiqueta de un campo (Barlow Condensed, mayúsculas). */
const FIELD_LABEL = "font-label text-sm font-semibold uppercase tracking-[0.08em] text-soma-brown";

interface DmsDialogProps {
    /** Si el diálogo está abierto (controlado por quien lo usa). */
    open: boolean;
    /** Se llama al abrir o cerrar (botón, "X", Escape o clic fuera). */
    onOpenChange: (open: boolean) => void;
    /** Botón que abre el diálogo. Debe ser un solo elemento que acepte `ref` (ej. `<Button>`). */
    trigger: React.ReactNode;
    /** Ícono del cuadro café del encabezado. */
    icon: LucideIcon;
    /** Texto rojo pequeño sobre el título (ej. "Editar documento"). */
    eyebrow: string;
    /** Título grande (ej. el nombre del documento). */
    title: string;
    /** Envía el formulario. El diálogo ya llama `preventDefault()`. */
    onSubmit: () => void;
    /** Texto del botón principal (ej. "Guardar cambios"). */
    submitLabel: string;
    /** Texto del botón principal mientras guarda (ej. "Guardando..."). */
    pendingLabel: string;
    /** `true` mientras se guarda: deshabilita el botón y muestra `pendingLabel`. */
    isPending?: boolean;
    /** Deshabilita el botón principal por otra razón (ej. no cargaron las opciones). */
    submitDisabled?: boolean;
    /** Error para mostrar al final del cuerpo, o `null`. */
    errorMessage?: string | null;
    /** Campos del formulario. */
    children: React.ReactNode;
}

/**
 * Diálogo de formulario del DMS: encabezado con ícono, "eyebrow" y título;
 * cuerpo con los campos (`children`); pie con "Cancelar" y el botón
 * principal. Lo usan "Editar" y "Nueva carpeta"; cualquier formulario corto
 * del DMS puede usarlo.
 *
 * Está hecho sobre Radix Dialog: atrapa el foco, cierra con Escape y con clic
 * fuera, y conecta el título y la descripción para lectores de pantalla.
 *
 * Para los campos, usar {@link DmsDialogField}, {@link DmsDialogNote} y la
 * clase {@link DMS_DIALOG_CONTROL}.
 *
 * @param props - ver {@link DmsDialogProps}
 * @returns el botón que abre y el diálogo
 * @example
 * <DmsDialog
 *     open={open}
 *     onOpenChange={setOpen}
 *     trigger={<Button>Nueva carpeta</Button>}
 *     icon={FolderPlus}
 *     eyebrow="Nueva carpeta"
 *     title="Dentro de Calidad"
 *     onSubmit={handleSubmit}
 *     submitLabel="Crear carpeta"
 *     pendingLabel="Creando..."
 *     isPending={isPending}
 *     errorMessage={errorMessage}
 * >
 *     <DmsDialogField label="Nombre" htmlFor="folder-name">
 *         <input id="folder-name" className={DMS_DIALOG_CONTROL} />
 *     </DmsDialogField>
 * </DmsDialog>
 */
export function DmsDialog({
    open,
    onOpenChange,
    trigger,
    icon: Icon,
    eyebrow,
    title,
    onSubmit,
    submitLabel,
    pendingLabel,
    isPending = false,
    submitDisabled = false,
    errorMessage = null,
    children,
}: DmsDialogProps) {
    /**
     * Evita que el navegador recargue la página y delega en `onSubmit`.
     *
     * @param event - submit del formulario
     * @example
     * <form onSubmit={handleSubmit} />
     */
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit();
    }

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-soma-black/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                <DialogPrimitive.Content
                    className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-soma-cream font-sans text-soma-black shadow-[0_24px_64px_rgba(13,11,9,0.28),0_2px_6px_rgba(13,11,9,0.10)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                >
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-col bg-soma-cream">
                        {/* Encabezado */}
                        {/* Encabezado rojo: todo lo de adentro va en blanco para contrastar. */}
                        <div className="flex items-center gap-4 bg-soma-red py-5 pr-5 pl-6 text-white md:pt-7 md:pr-7 md:pb-[22px] md:pl-8">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25">
                                <Icon size={22} strokeWidth={1.8} aria-hidden />
                            </span>
                            <div className="flex min-w-0 grow flex-col gap-0.5">
                                <DialogPrimitive.Description className="font-label text-[13px] font-semibold uppercase tracking-[0.1em] text-white/80">
                                    {eyebrow}
                                </DialogPrimitive.Description>
                                <DialogPrimitive.Title className="truncate text-[22px] leading-tight font-semibold text-white">
                                    {title}
                                </DialogPrimitive.Title>
                            </div>
                            <DialogPrimitive.Close
                                aria-label="Cerrar"
                                className="flex size-11 shrink-0 items-center justify-center self-start rounded-[10px] text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                            >
                                <X size={20} strokeWidth={2} aria-hidden />
                            </DialogPrimitive.Close>
                        </div>

                        {/* Cuerpo: hace scroll si los campos no caben */}
                        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto px-6 pt-[26px] pb-[30px] md:px-8">
                            {children}
                            {errorMessage && (
                                <p role="alert" className="rounded-[10px] bg-soma-red/10 px-3.5 py-3 text-sm text-soma-red">
                                    {errorMessage}
                                </p>
                            )}
                        </div>

                        {/* Pie */}
                        <div className="flex flex-col-reverse gap-2.5 border-t border-soma-line bg-soma-cream-dk px-6 py-[18px] sm:flex-row sm:justify-end md:px-8">
                            <DialogPrimitive.Close
                                type="button"
                                className="h-11 rounded-[10px] border border-soma-line bg-white px-5 text-[15px] font-medium text-soma-brown transition-colors hover:bg-soma-sand focus-visible:ring-2 focus-visible:ring-soma-brown/30 focus-visible:outline-none"
                            >
                                Cancelar
                            </DialogPrimitive.Close>
                            <button
                                type="submit"
                                disabled={isPending || submitDisabled}
                                aria-busy={isPending}
                                className="h-11 rounded-[10px] bg-soma-red px-[22px] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(13,11,9,0.15)] transition-colors hover:bg-soma-red-dk focus-visible:ring-4 focus-visible:ring-soma-red/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isPending ? pendingLabel : submitLabel}
                            </button>
                        </div>
                    </form>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

interface DmsDialogFieldProps {
    /** Texto de la etiqueta. */
    label: string;
    /** `id` del control. Sin él, la etiqueta es solo texto (ej. para un grupo de chips). */
    htmlFor?: string;
    /** Contenido a la derecha de la etiqueta (ej. un contador). */
    aside?: React.ReactNode;
    /** El control: input, select, chips... */
    children: React.ReactNode;
    className?: string;
}

/**
 * Campo de un {@link DmsDialog}: etiqueta en mayúsculas y el control debajo.
 *
 * @param label - texto de la etiqueta
 * @param htmlFor - `id` del control al que apunta la etiqueta
 * @param aside - contenido opcional a la derecha de la etiqueta
 * @param children - el control
 * @param className - clases extra para el contenedor
 * @returns el campo
 * @example
 * <DmsDialogField label="Nombre" htmlFor="doc-name">
 *     <input id="doc-name" className={DMS_DIALOG_CONTROL} />
 * </DmsDialogField>
 */
export function DmsDialogField({ label, htmlFor, aside, children, className }: DmsDialogFieldProps) {
    const labelNode = htmlFor ? (
        <label htmlFor={htmlFor} className={FIELD_LABEL}>{label}</label>
    ) : (
        <span className={FIELD_LABEL}>{label}</span>
    );

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {aside ? (
                <div className="flex items-center justify-between gap-2">
                    {labelNode}
                    {aside}
                </div>
            ) : (
                labelNode
            )}
            {children}
        </div>
    );
}

/**
 * Aviso informativo dentro de un {@link DmsDialog} (fondo arena e ícono "i").
 *
 * @param children - texto del aviso
 * @returns el aviso
 * @example
 * <DmsDialogNote>Las áreas heredadas no aparecen aquí.</DmsDialogNote>
 */
export function DmsDialogNote({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5 rounded-[10px] bg-soma-sand px-3.5 py-3">
            <Info size={18} strokeWidth={1.8} aria-hidden className="mt-px shrink-0 text-soma-taupe-lt" />
            <p className="text-sm leading-[1.45] text-soma-taupe">{children}</p>
        </div>
    );
}
