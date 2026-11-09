import { supabase } from '@/lib/core/auth/client';
import { AuthError, AuthErrorCode } from '@/lib/errors/auth';
import { UserError, UserErrorCode } from '@/lib/errors/user';
import type { AuthProvider, CurrentUser} from '@/lib/core/auth/provider/auth.provider';

type OTPType = 'invite' | 'recovery';
let verifiedTokenHash: string | null = null; 

const MIN_PASSWORD_LENGTH = 8;
const HAS_NUMBER = /\d/;
// Cualquier carácter que no sea letra (incluye ñ y acentos), número o espacio.
const HAS_SPECIAL_CHARACTER = /[^\p{L}\p{N}\s]/u;

/**
 * Exige que la contraseña tenga al menos 8 caracteres, un número y un símbolo
 * especial.
 *
 * @param password - contraseña en texto plano
 * @throws {AuthError} `WeakPassword` si no cumple alguno de los requisitos
 * @example
 * verifySafePassword("soma-2026")
 */
function verifySafePassword(password: string): void {
    const isSafe = password.length >= MIN_PASSWORD_LENGTH
        && HAS_NUMBER.test(password)
        && HAS_SPECIAL_CHARACTER.test(password);

    if (!isSafe) {
        throw new AuthError(
            AuthErrorCode.WeakPassword,
            'La contraseña no cumple los requisitos mínimos.',
            'Usa al menos 8 caracteres, un número y un símbolo especial.',
            422,
        );
    }
}

/**
 * Verifica el token del link del correo. Si es válido, Supabase crea una sesión
 * para el dueño del link y el token queda gastado. El token se guarda en
 * `verifiedTokenHash` para no volver a verificarlo si el paso siguiente falla.
 *
 * @param otp - tipo de link: `invite` o `recovery`
 * @param tokenHash - `token_hash` que llega en el link del correo
 * @throws {AuthError} `LinkInvalid` si el token expiró o ya se usó;
 *   `OtpVerificationError` si ocurrió un error inesperado al verificarlo
 * @example
 * await verifyEmailLink('invite', tokenHash)
 */
async function verifyEmailLink(otp: OTPType, tokenHash: string): Promise<void> {
    try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otp,
        });

        if (verifyError) {
            throw new AuthError(
                AuthErrorCode.LinkInvalid,
                verifyError.message,
                'El link no es válido o ya expiró.',
                401,
            );
        }

        verifiedTokenHash = tokenHash;
    } catch (err) {
        if (err instanceof AuthError) throw err;
        throw new AuthError(
            AuthErrorCode.OtpVerificationError,
            err instanceof Error ? err.message : String(err),
            'No se pudo verificar el link.',
            500,
        );
    }
}

/**
 * Valida la contraseña, verifica el token del correo y guarda la contraseña en
 * la cuenta. La contraseña se valida primero porque verificar el link gasta el
 * token. Si un intento anterior ya verificó este mismo token, se reutiliza la
 * sesión que dejó en lugar de verificarlo otra vez.
 *
 * @param otp - tipo de link: `invite` o `recovery`
 * @param tokenHash - `token_hash` que llega en el link del correo
 * @param password - contraseña nueva en texto plano
 * @throws {AuthError} `WeakPassword` si la contraseña no cumple los requisitos;
 *   `LinkInvalid` si el token expiró o ya se usó; `OtpVerificationError` si
 *   ocurrió un error inesperado al verificar el link; `NewPasswordError` si el
 *   proveedor no pudo guardar la contraseña
 * @example
 * await setPasswordHelper('recovery', tokenHash, "soma-2026")
 */
async function setPasswordHelper(otp: OTPType, tokenHash: string, password: string): Promise<void>{
    verifySafePassword(password);

    // Si este token ya se verificó en un intento anterior, se reutiliza la sesión;
    // volver a verificarlo fallaría porque el token ya se gastó.
    if (verifiedTokenHash !== tokenHash) await verifyEmailLink(otp, tokenHash);

    // La verificación deja una sesión activa; updateUser la usa para fijar la contraseña.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
        const code = updateError.code === 'weak_password'
            ? AuthErrorCode.WeakPassword
            : AuthErrorCode.NewPasswordError;

        throw new AuthError(code, updateError.message, 'No se pudo establecer la contraseña.', 422);
    }
    verifiedTokenHash = null;
}

/**
 * Implementación de {@link AuthProvider} sobre Supabase. Si el proyecto
 * migra de proveedor, este es el único archivo que debe reescribirse —
 * `AuthProvider` y todo lo que consume `authProvider` no cambia.
 */
class SupabaseAuthService implements AuthProvider {
    async login(email: string, password: string): Promise<void> {
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

    async acceptInvite(tokenHash: string, password: string): Promise<void> {
        await setPasswordHelper('invite', tokenHash, password);
    }

    async getCurrentUser(): Promise<CurrentUser | null> {
        const { data: { user } } = await supabase.auth.getUser();

        // No tener sesión es un estado normal, no un error.
        if (!user) return null;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('nombre, apellido_paterno, role')
            .eq('id', user.id)
            .single();

        if (profileError) {
            throw new UserError(
                UserErrorCode.UserData,
                profileError.message,
                'No se pudo cargar tu perfil.',
                500,
            );
        }

        const name = [profile.nombre, profile.apellido_paterno].filter(Boolean).join(' ');

        return {
            email: user.email ?? '',
            name: name || 'Usuario',
            role: profile.role,
        };
    }

    onAuthChange(callback: () => void): () => void {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            // Llamar a Supabase dentro de este callback puede bloquearse; setTimeout lo saca de ahí.
            setTimeout(callback, 0);
        });

        return () => subscription.unsubscribe();
    }

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new AuthError(
                AuthErrorCode.AuthenticationFailure,
                error.message,
                'No se pudo cerrar la sesión.',
                500,
            );
        }
    }

    async setNewPassword(tokenHash: string, password: string): Promise<void> {
        await setPasswordHelper('recovery', tokenHash, password);
    }

    async requestPasswordReset(email: string): Promise<void> {
        // Se envía desde la Edge Function y no con supabase.auth.resetPasswordForEmail:
        // este cliente usa PKCE y el link no traería un token_hash que verifyOtp acepte.
        const { error } = await supabase.functions.invoke('request-password-reset', {
            body: { email },
        });

        if (error) {
            throw new AuthError(
                AuthErrorCode.PasswordResetRequestError,
                error.message,
                'No se pudo enviar el correo de recuperación.',
                500,
            );
        }
    }
}

export const authProvider: AuthProvider = new SupabaseAuthService();
