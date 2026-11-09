"use client";

import { usePathname } from "next/navigation";

import { useUser } from "@/lib/core/context/userContext";
import Navbar from "@/components/Navbar";
import { LogoutButton } from "@/components/DMS/LogoutButton";

// Páginas para entrar al sistema: aquí nunca se ofrece cerrar sesión.
const AUTH_ROUTES = ["/DMS/login", "/DMS/set-password"];

/**
 * Estructura común del DMS: fondo, color de texto y Navbar. Cerrar sesión solo
 * aparece con sesión activa y fuera de las páginas de autenticación.
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

    return (
        <div className="min-h-[calc(100vh-72px)] bg-soma-off-wh text-soma-brown">
            <Navbar
                isDms={true}
                role={user?.role}
                name={user?.name}
                dmsAction={showLogout ? <LogoutButton /> : undefined}
            />
            {children}
        </div>
    );
}
