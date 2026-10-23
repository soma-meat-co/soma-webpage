import { publicEnv } from '@/lib/publicEnv';
import { privateEnv } from '@/lib/privateEnv';
import { createClient } from '@supabase/supabase-js';

const url: string = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey: string = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(url, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Da de alta un usuario nuevo sin contraseña y le envía un correo de invitación.
 * El usuario define su propia contraseña al abrir el link, que lo redirige a /accountRegistry.
 *
 * @param email - correo del usuario a invitar
 * @returns el usuario creado por Supabase (sin sesión activa)
 * @throws {Error} si Supabase rechaza la invitación (correo duplicado, formato inválido, etc.)
 * @example
 * const user = await inviteNewUser("empleado@somameat.com")
 */
async function inviteNewUser(email: string) {
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/accountRegistry`,
    });

    if (error) {
        throw new Error(`No se pudo invitar a ${email}: ${error.message}`);
    }

    return data.user;
}
