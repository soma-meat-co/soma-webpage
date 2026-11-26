"use client";

import { usePathname } from "next/navigation";

import { useUser } from "@/lib/core/context/userContext";
import Navbar from "@/components/Navbar";
import { LogoutButton } from "@/components/DMS/LogoutButton";
import { BackButton } from "@/components/DMS/BackButton";

// Páginas para entrar al sistema: aquí nunca se ofrece cerrar sesión.
const AUTH_ROUTES = ["/DMS/login", "/DMS/set-password"];

// Inicio del DMS: no hay a dónde "volver" dentro del sistema.
const HOME_ROUTE = "/DMS";

// Explorador de carpetas: "Volver" va directo al inicio. Con el historial
// regresaría carpeta por carpeta; para subir un nivel está "Regresar a <padre>".
const DOCUMENTS_ROUTE = "/DMS/documents";

/**
 * Estructura común del DMS: fondo, color de texto y Navbar. Cerrar sesión solo
 * aparece con sesión activa y fuera de las páginas de autenticación. "Volver"
 * aparece en las mismas condiciones, excepto en el inicio (`/DMS`).
 *
 * @param children - página actual del DMS
 * @returns la página envuelta con la estructura del DMS
 * @example
 * <DmsShell>{children}</DmsShell>
 */
export function DmsShell({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const pathname = usePathname();
    const showLogout = user !== null && !AUTH_ROUTES.includes(pathname);
    const showBack = showLogout && pathname !== HOME_ROUTE;
    const isDocumentsRoute = pathname === DOCUMENTS_ROUTE || pathname.startsWith(`${DOCUMENTS_ROUTE}/`);

    return (
        <div className="min-h-[calc(100vh-72px)] bg-soma-off-wh text-soma-brown">
            <Navbar
                isDms={true}
                role={user?.role}
                name={user?.name}
                dmsAction={showLogout ? <LogoutButton /> : undefined}
            />
            {showBack && (
                <div className="mx-auto w-full max-w-5xl px-4 pt-4 md:px-8">
                    <BackButton href={isDocumentsRoute ? HOME_ROUTE : undefined} />
                </div>
            )}
            {children}
        </div>
    );
}
