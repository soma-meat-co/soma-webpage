import type { NextRequest, NextResponse } from "next/server";

import { getProxySession } from "@/lib/core/auth/proxySession";
import { isAdminRole } from "@/lib/core/auth/roles";

const HOME_ROUTE = "/DMS";
const LOGIN_ROUTE = "/DMS/login";
const ADMIN_ROUTE = "/DMS/admin";

// Rutas del DMS disponibles sin sesión.
const PUBLIC_ROUTES = [LOGIN_ROUTE, "/DMS/reset-password", "/DMS/set-password"];

/**
 * Controla la navegación del DMS antes de entregar cada página: exige sesión y
 * reserva `/DMS/admin` para administradores. No sustituye a RLS, que protege
 * los datos.
 *
 * @param request - request que entra a una ruta del DMS
 * @returns la respuesta que deja pasar la request o la redirige
 * @example
 * // Next.js ejecuta esta función por convención; no se llama desde el código.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
    const session = await getProxySession(request);
    const { pathname } = request.nextUrl;

    if (!session.isAuthenticated) {
        return PUBLIC_ROUTES.includes(pathname) ? session.next() : session.redirect(LOGIN_ROUTE);
    }

    if (pathname === LOGIN_ROUTE) {
        return session.redirect(HOME_ROUTE);
    }

    if (pathname === ADMIN_ROUTE || pathname.startsWith(`${ADMIN_ROUTE}/`)) {
        const role = await session.getRole();
        const canAccess = role !== null && isAdminRole(role);

        return canAccess ? session.next() : session.redirect(HOME_ROUTE);
    }

    return session.next();
}

export const config = {
    matcher: "/DMS/:path*",
};
