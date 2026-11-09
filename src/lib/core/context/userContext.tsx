"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CurrentUser } from "@/lib/core/auth/provider/auth.provider";
import { authProvider } from "@/lib/core/auth/service/user.service";

interface UserContextValue {
    user: CurrentUser | null; 
    loading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Provee el usuario autenticado a todo el árbol de componentes que envuelve.
 * Se suscribe a los cambios de sesión y recarga el usuario en cada uno, así
 * que login y logout no tienen que actualizar este contexto. Sus datos solo
 * sirven para la UI: los permisos se validan en el servidor.
 *
 * @param children - árbol de componentes que tendrá acceso al usuario
 * @returns el provider del contexto con `user` y `loading`
 * @example
 * <UserProvider>
 *   <DmsShell>{children}</DmsShell>
 * </UserProvider>
 */
export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = authProvider.onAuthChange(async () => {
            try {
                const usuario = await authProvider.getCurrentUser();
                setUser(usuario);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook para leer el usuario autenticado desde cualquier componente dentro
 * de `<UserProvider>`.
 *
 * @returns `user`, que es `null` sin sesión, y `loading`, que es `true`
 *   mientras se determina si hay sesión
 * @throws {Error} si se usa fuera de `<UserProvider>`
 * @example
 * const { user, loading } = useUser()
 */
export function useUser(): UserContextValue {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error("useUser debe usarse dentro de <UserProvider>");
    }

    return context;
}
