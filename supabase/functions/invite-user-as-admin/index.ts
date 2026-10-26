// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

/** Dominio permitido para cuentas del DMS. */
const INSTITUTIONAL_DOMAIN = "@somameat.com";

/** Datos que el frontend envía para invitar a un usuario. */
interface InviteUserBody {
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
}

/**
 * Valida y normaliza el body de la petición.
 *
 * @param body - JSON recibido en la petición
 * @returns los datos normalizados, o `null` si falta un campo requerido
 * @example
 * const input = parseBody(await req.json())
 * if (!input) return errorResponse(400, "invalid_body", "...")
 */
function parseBody(body: unknown): InviteUserBody | null {
  if (typeof body !== "object" || body === null) return null;
  const { email, nombre, apellido_paterno, apellido_materno } = body as Record<string, unknown>;

  if (typeof email !== "string" || !email.includes("@")) return null;
  if (typeof nombre !== "string" || nombre.trim() === "") return null;
  if (typeof apellido_paterno !== "string" || apellido_paterno.trim() === "") return null;
  if (apellido_materno !== undefined && typeof apellido_materno !== "string") return null;

  return {
    email: email.trim().toLowerCase(),
    nombre: nombre.trim(),
    apellido_paterno: apellido_paterno.trim(),
    apellido_materno: apellido_materno?.trim() || undefined,
  };
}

/**
 * Construye una respuesta de error con el mismo formato en toda la función.
 *
 * @param status - código HTTP
 * @param code - identificador del error para el frontend
 * @param message - mensaje legible
 * @returns la respuesta JSON `{ code, message }`
 * @example
 * return errorResponse(403, "forbidden", "Solo un admin puede invitar usuarios.")
 */
function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ code, message }, { status });
}

/**
 * Invita a un nuevo usuario con rol `user`. Solo un admin puede llamarla.
 *
 * Flujo:
 * 1. `withSupabase` valida el JWT de quien llama (auth: "user").
 * 2. Se verifica con `public.is_admin()`, ejecutada con el cliente del usuario
 *    (respeta RLS y usa `auth.uid()` del JWT).
 * 3. Se envía la invitación con el cliente admin. El trigger `on_auth_user_created`
 *    crea el profile con los nombres; el rol queda en su default `user`.
 * 4. Se registra `created_by` en el profile.
 *
 * El rol nunca se recibe del body: esta función no puede crear admins.
 *
 * @param req - POST con body `{ email, nombre, apellido_paterno, apellido_materno? }`
 * @returns 201 `{ id, email }` del usuario invitado
 * @throws 400 `invalid_body` si faltan campos o el email no es válido
 * @throws 422 `email_not_institutional` si el email no es `@somameat.com`
 * @throws 403 `forbidden` si quien llama no es admin
 * @throws 409 `email_exists` si ya existe un usuario con ese email
 * @throws 500 `invite_failed` / `admin_check_failed` ante errores de Supabase
 * @example
 * const { data, error } = await supabase.functions.invoke("invite-user-as-admin", {
 *   body: { email: "ana@somameat.com", nombre: "Ana", apellido_paterno: "López" },
 * })
 */
export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return errorResponse(405, "method_not_allowed", "Usa POST.");
    }

    const { data: isAdmin, error: adminCheckError } = await ctx.supabase.rpc("is_admin");
    if (adminCheckError) {
      console.error("is_admin falló:", adminCheckError);
      return errorResponse(500, "admin_check_failed", "No se pudo verificar el rol.");
    }
    if (isAdmin !== true) {
      return errorResponse(403, "forbidden", "Solo un admin puede invitar usuarios.");
    }

    const input = parseBody(await req.json().catch(() => null));
    if (!input) {
      return errorResponse(400, "invalid_body", "Se requiere email, nombre y apellido_paterno.");
    }

    // endsWith y no includes: "x@somameat.com.mx" o "x@somameat.company" no deben pasar.
    if (!input.email.endsWith(INSTITUTIONAL_DOMAIN)) {
      return errorResponse(422, "email_not_institutional", "El correo tiene que ser institucional (@somameat.com).");
    }

    // Si INVITE_REDIRECT_URL no está definida, Supabase usa el Site URL del proyecto.
    const { data: invited, error: inviteError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(
      input.email,
      {
        data: {
          nombre: input.nombre,
          apellido_paterno: input.apellido_paterno,
          apellido_materno: input.apellido_materno,
        },
        redirectTo: Deno.env.get("INVITE_REDIRECT_URL"),
      },
    );

    if (inviteError) {
      if (inviteError.code === "email_exists") {
        return errorResponse(409, "email_exists", "Ya existe un usuario con ese email.");
      }
      console.error("inviteUserByEmail falló:", inviteError);
      return errorResponse(500, "invite_failed", "No se pudo enviar la invitación.");
    }

    // No es crítico: si falla, el usuario ya fue invitado con rol `user`.
    const { error: createdByError } = await ctx.supabaseAdmin
      .from("profiles")
      .update({ created_by: ctx.userClaims?.id })
      .eq("id", invited.user.id);
    if (createdByError) {
      console.error("No se pudo registrar created_by:", createdByError);
    }

    return Response.json({ id: invited.user.id, email: invited.user.email }, { status: 201 });
  }),
};

/* Para invocar localmente:

  1. `npx supabase start` y `npx supabase functions serve invite-user-as-admin`
  2. Con el access_token de un usuario admin:

  curl -i --request POST 'http://127.0.0.1:54321/functions/v1/invite-user-as-admin' \
    --header 'Authorization: Bearer <ACCESS_TOKEN_DEL_ADMIN>' \
    --header 'Content-Type: application/json' \
    --data '{"email":"ana@somameat.com","nombre":"Ana","apellido_paterno":"López"}'

*/
