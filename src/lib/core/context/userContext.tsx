"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthSession } from "@/lib/core/auth/provider/auth.provider";

interface UserContextValue {
    session: AuthSession | null;
    setSession: (session: AuthSession | null) => void;
    role: string | null;
    setRole: (role: string | null) => void; 
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Provee la sesión del usuario autenticado a todo el árbol de componentes
 * que envuelve. No llama a `authProvider` directamente — solo guarda el
 * estado; quien inicia sesión (ej. el login form) es responsable de llamar
 * `setSession` con el resultado de `authProvider.login()`.
 */
export function UserProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [role, setRole] = useState<string | null>(null); 

    return (
        <UserContext.Provider value={{ session, setSession, role, setRole }}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * Hook para leer/actualizar la sesión del usuario desde cualquier
 * componente dentro de `<UserProvider>`.
 *
 * @throws {Error} si se usa fuera de `<UserProvider>`
 */
export function useUser(): UserContextValue {
    const context = useContext(UserContext);

    if (context === undefined) {
        throw new Error("useUser debe usarse dentro de <UserProvider>");
    }

    return context;
}
