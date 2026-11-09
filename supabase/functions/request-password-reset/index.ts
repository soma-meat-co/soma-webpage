// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

/** Dominio permitido para cuentas del DMS. */
const INSTITUTIONAL_DOMAIN = "@somameat.com";

/**
 * Valida y normaliza el body de la petición.
 *
 * @param body - JSON recibido en la petición
 * @returns el correo en minúsculas y sin espacios, o `null` si no es válido
 * @example
 * const email = parseEmail(await req.json())
 * if (!email) return acceptedResponse()
 */
function parseEmail(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const { email } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.includes("@")) return null;
  return email.trim().toLowerCase();
}

/**
 * Construye una respuesta de error con el mismo formato en toda la función.
 *
 * @param status - código HTTP
 * @param code - identificador del error para el frontend
 * @param message - mensaje legible
 * @returns la respuesta JSON `{ code, message }`
 * @example
 * return errorResponse(500, "send_failed", "No se pudo enviar el correo de recuperación.")
 */
function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ code, message }, { status });
}

/**
 * Respuesta de éxito. Es la misma exista o no la cuenta, para que nadie pueda
 * usar esta función para averiguar qué correos están registrados.
 *
 * @returns 200 `{ ok: true }`
 * @example
 * return acceptedResponse()
 */
function acceptedResponse(): Response {
  return Response.json({ ok: true }, { status: 200 });
}

/**
 * Envía el correo de recuperación de contraseña, solo si el correo tiene cuenta.
 * La llama la página `/DMS/reset-password` sin sesión, con la publishable key.
 *
 * Flujo:
 * 1. `withSupabase` valida la publishable key (auth: "publishable").
 * 2. Si el correo no es válido o no es institucional, responde éxito sin enviar nada.
 * 3. `public.email_has_account()` revisa `auth.users` con el cliente admin.
 * 4. Si la cuenta no existe, responde éxito sin enviar nada.
 * 5. Si existe, envía el correo con la plantilla `recovery`.
 *
 * Solo responde con error cuando el correo no se pudo enviar. Los detalles de
 * cada fallo se registran en los logs de la función.
 *
 * El correo se envía desde el servidor con el flujo implícito, así que el link
 * trae un `token_hash` normal que `verifyOtp` acepta sin un code verifier.
 *
 * @param req - POST con body `{ email }`
 * @returns 200 `{ ok: true }` en todos los casos excepto cuando el envío falla
 * @throws 500 `misconfigured` si falta el secreto `RESET_PASSWORD_REDIRECT_URL`
 * @throws 500 `lookup_failed` si no se pudo consultar si la cuenta existe
 * @throws 500 `send_failed` si Supabase no pudo enviar el correo
 * @example
 * const { error } = await supabase.functions.invoke("request-password-reset", {
 *   body: { email: "ana@somameat.com" },
 * })
 */
export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return errorResponse(405, "method_not_allowed", "Usa POST.");
    }

    // Un correo inválido o externo no puede tener cuenta: se responde éxito sin enviar nada.
    // endsWith y no includes: "x@somameat.com.mx" o "x@somameat.company" no deben pasar.
    const email = parseEmail(await req.json().catch(() => null));
    if (!email || !email.endsWith(INSTITUTIONAL_DOMAIN)) {
      return acceptedResponse();
    }

    // La plantilla arma el link con {{ .RedirectTo }}; sin esta variable el link
    // apuntaría al Site URL y el usuario no llegaría a /DMS/reset-password.
    const redirectTo = Deno.env.get("RESET_PASSWORD_REDIRECT_URL");
    if (!redirectTo) {
      console.error("Falta el secreto RESET_PASSWORD_REDIRECT_URL.");
      return errorResponse(500, "misconfigured", "La función no está configurada.");
    }

    const { data: hasAccount, error: lookupError } = await ctx.supabaseAdmin.rpc(
      "email_has_account",
      { p_email: email },
    );
    if (lookupError) {
      console.error("email_has_account falló:", lookupError);
      return errorResponse(500, "lookup_failed", "No se pudo procesar la solicitud.");
    }

    if (hasAccount !== true) {
      return acceptedResponse();
    }

    const { error: resetError } = await ctx.supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (resetError) {
      console.error("resetPasswordForEmail falló:", resetError);
      return errorResponse(500, "send_failed", "No se pudo enviar el correo de recuperación.");
    }

    return acceptedResponse();
  }),
};

/* Para invocar localmente:

  1. `npx supabase start` y `npx supabase functions serve request-password-reset`
  2. Con la publishable key local:

  curl -i --request POST 'http://127.0.0.1:54321/functions/v1/request-password-reset' \
    --header 'apikey: <PUBLISHABLE_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{"email":"ana@somameat.com"}'

*/
