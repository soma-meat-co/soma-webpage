import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import type { Role } from '@/lib/core/auth/provider/auth.provider';
import { publicEnv } from '@/lib/publicEnv';

/**
 * Sesión del usuario dentro de `src/proxy.ts`. Las respuestas deben crearse con
 * `next` y `redirect` para conservar las cookies si la sesión se renovó.
 */
export interface ProxySession {
    isAuthenticated: boolean;
    getRole(): Promise<Role | null>;
    /**
     * Deja continuar la request.
     *
     * @returns la respuesta con las cookies de sesión actualizadas
     * @example
     * return session.next()
     */
    next(): NextResponse;
    redirect(pathname: string): NextResponse;
}

/**
 * Valida la sesión de una request del proxy. Usa `getUser()` porque consulta a
 * Supabase; `getSession()` solo leería una cookie que el cliente puede alterar.
 * Si el token venció, esta llamada lo renueva. Un fallo al validar se trata como
 * falta de sesión.
 *
 * @param request - request que recibió el proxy
 * @returns la sesión y las funciones para responder sin perder sus cookies
 * @example
 * const session = await getProxySession(request)
 * if (!session.isAuthenticated) return session.redirect("/DMS/login")
 */
export async function getProxySession(request: NextRequest): Promise<ProxySession> {
    const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];
    const pendingHeaders: Record<string, string> = {};

    const supabase = createServerClient(
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookies, headers) {
                    // Se actualiza la request para que la página reciba la sesión renovada.
                    cookies.forEach(({ name, value }) => request.cookies.set(name, value));
                    pendingCookies.push(...cookies);
                    Object.assign(pendingHeaders, headers);
                },
            },
        },
    );

    const { data: { user } } = await supabase.auth.getUser();

    /**
     * Copia a la respuesta las cookies y los encabezados de la sesión renovada.
     *
     * @param response - respuesta que se enviará al navegador
     * @returns la misma respuesta con los datos de sesión
     * @example
     * return withSession(NextResponse.next({ request }))
     */
    const withSession = (response: NextResponse): NextResponse => {
        pendingCookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });
        Object.entries(pendingHeaders).forEach(([name, value]) => {
            response.headers.set(name, value);
        });
        return response;
    };

    return {
        isAuthenticated: user !== null,

        async getRole() {
            if (!user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            return error ? null : data.role;
        },

        next() {
            return withSession(NextResponse.next({ request }));
        },

        redirect(pathname) {
            return withSession(NextResponse.redirect(new URL(pathname, request.url)));
        },
    };
}
