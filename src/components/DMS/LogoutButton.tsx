"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authProvider } from "@/lib/core/auth/service/user.service";

/**
 * Botón que cierra la sesión y lleva al usuario al login. Si falla, se queda
 * en la página y muestra un aviso.
 *
 * @returns el botón de cerrar sesión
 * @example
 * <LogoutButton />
 */
export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);

    /**
     * Cierra la sesión y redirige al login. `replace` evita que el botón
     * Atrás regrese a una página que requiere sesión.
     *
     * @returns una promesa que termina cuando se resuelve el cierre de sesión
     * @example
     * <Button onClick={handleLogout}>Cerrar sesión</Button>
     */
    const handleLogout = async (): Promise<void> => {
        setLoading(true);
        setFailed(false);

        try {
            await authProvider.logout();
            router.replace("/DMS/login");
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            {failed && (
                <p role="alert" className="text-xs text-soma-red">
                    No se pudo cerrar sesión.
                </p>
            )}
            <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
                className="h-11 shrink-0 border-soma-gray px-3 text-soma-brown shadow-soma md:h-9"
            >
                {loading ? <Loader2 className="animate-spin" aria-hidden /> : <LogOut aria-hidden />}
                <span className="sr-only sm:not-sr-only">Cerrar sesión</span>
            </Button>
        </div>
    );
}
