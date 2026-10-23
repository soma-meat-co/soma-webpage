import { publicEnv } from '@/lib/publicEnv';
import { createClient } from '@supabase/supabase-js';
import { AuthError, AuthErrorCode } from '@/lib/errors/auth';
import type { AuthProvider, AuthSession } from '@/lib/core/auth/provider/auth.provider';

const url: string = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
const anon: string = publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(url, anon);

/**
 * Implementación de {@link AuthProvider} sobre Supabase. Si el proyecto
 * migra de proveedor, este es el único archivo que debe reescribirse —
 * `AuthProvider` y todo lo que consume `authProvider` no cambia.
 */
class SupabaseAuthService implements AuthProvider {
    async login(email: string, password: string): Promise<AuthSession> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                const code = error.code === 'email_not_confirmed'
                    ? AuthErrorCode.EmailNotConfirmed
                    : error.code === 'user_not_found'
                    ? AuthErrorCode.UserNotFound
                    : AuthErrorCode.AuthenticationFailure;

                throw new AuthError(code, error.message, 'No se pudo iniciar sesión.', 401);
            }

            if (!data.session) {
                throw new AuthError(
                    AuthErrorCode.AuthenticationFailure,
                    'Supabase no devolvió una sesión.',
                    'No se pudo iniciar sesión.',
                    401,
                );
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('name, role')
                .eq('id', data.user.id)
                .single();

            if (profileError || !profile.role) {
                throw new AuthError(
                    AuthErrorCode.RoleNotFound,
                    profileError?.message ?? 'El usuario no tiene rol asignado.',
                    'No se puede iniciar sesión.',
                    403,
                );
            };
            return {
                userId: data.user.id,
                email: data.user.email ?? email,
                name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? email,
                accessToken: data.session.access_token,
                role: profile.role, 
            };
        } catch (err) {
            if (err instanceof AuthError) throw err;
            throw new AuthError(
                AuthErrorCode.AuthenticationFailure,
                err instanceof Error ? err.message : String(err),
                'No se pudo iniciar sesión.',
                500,
            );
        }
    }
}

export const authProvider: AuthProvider = new SupabaseAuthService();
