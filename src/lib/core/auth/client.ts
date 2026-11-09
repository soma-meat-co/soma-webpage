import { createBrowserClient } from '@supabase/ssr';
import { publicEnv } from '@/lib/publicEnv';

/**
 * Cliente de Supabase para el navegador. Guarda la sesión en cookies para que
 * `src/proxy.ts` pueda leerla, a diferencia de `createClient`, que usa localStorage.
 *
 * Todos los servicios de cliente deben importar esta instancia: es la que tiene
 * la sesión y envía el JWT del usuario en cada petición.
 */
export const supabase = createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
