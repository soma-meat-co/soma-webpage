import 'server-only'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/publicEnv';

/**
 * Crea un cliente de Supabase para el servidor que actúa como el usuario de la
 * request actual: lee su sesión de las cookies y envía su JWT, así que RLS y
 * `auth.uid()` aplican igual que en el navegador. Usa la publishable key, nunca
 * la secret key.
 *
 * Se crea un cliente nuevo en cada llamada porque en el servidor los módulos se
 * comparten entre requests; una instancia global mezclaría sesiones de usuarios.
 *
 * Funciona en Server Actions, Route Handlers y Server Components. En Server
 * Components Next no permite escribir cookies, así que una renovación del token
 * se ignora ahí; `src/proxy.ts` ya la renueva en cada request.
 *
 * @returns un cliente de Supabase con la sesión del usuario de esta request
 * @example
 * const supabase = await createSupabaseServerClient()
 * const { data: isAdmin, error } = await supabase.rpc('is_admin')
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        publicEnv.NEXT_PUBLIC_SUPABASE_URL,
        publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Llamado desde un Server Component: Next no permite escribir
                        // cookies ahí. El proxy se encarga de renovar la sesión.
                    }
                },
            },
        },
    );
}
