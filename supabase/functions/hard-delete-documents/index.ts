// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

/** Días que un documento pasa en soft delete antes de borrarse de verdad. */
const RETENTION_DAYS = 30;

/** Credenciales de R2, leídas de los secretos de la función. */
interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Documento listo para borrarse. */
interface ExpiredDocument {
  id: string;
  file_path: string;
}

/**
 * Lee la configuración de R2 de los secretos de la función.
 *
 * @returns la configuración, o `null` si falta algún secreto
 * @example
 * const r2 = readR2Config()
 * if (!r2) return errorResponse(500, "misconfigured", "La función no está configurada.")
 */
function readR2Config(): R2Config | null {
  const accountId = Deno.env.get("R2_ACCOUNT_ID");
  const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
  const bucket = Deno.env.get("R2_BUCKET");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

/**
 * Crea el cliente S3 apuntando a R2. Los checksums quedan en `WHEN_REQUIRED`,
 * igual que en `storage.service.ts` de Next, por compatibilidad con R2.
 *
 * @param config - credenciales y cuenta de R2
 * @returns el cliente listo para usarse
 * @example
 * const r2Client = createR2Client(r2)
 */
function createR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

/**
 * Construye una respuesta de error con el mismo formato en toda la función.
 *
 * @param status - código HTTP
 * @param code - identificador del error
 * @param message - mensaje legible
 * @returns la respuesta JSON `{ code, message }`
 * @example
 * return errorResponse(500, "lookup_failed", "No se pudieron consultar los documentos.")
 */
function errorResponse(status: number, code: string, message: string): Response {
  return Response.json({ code, message }, { status });
}

/**
 * Borra definitivamente los documentos que llevan más de `RETENTION_DAYS` días
 * en soft delete: primero el archivo en R2, después la fila en `documents`.
 * La llama el cron `hard-delete-documents` con la secret key en `apikey`.
 *
 * Flujo:
 * 1. `withSupabase` valida la secret key (auth: "secret").
 * 2. Busca en `documents` las filas con `deleted_at` más viejo que la retención.
 * 3. Borra cada archivo de R2. Si uno falla, se registra y su fila se conserva
 *    para reintentarlo en la siguiente corrida.
 * 4. Borra las filas cuyos archivos sí se borraron. `document_areas` se borra
 *    en cascada.
 *
 * Nunca se borra una fila sin haber borrado antes su archivo: así no quedan
 * archivos en R2 sin un registro que los encuentre.
 *
 * @param req - POST sin body
 * @returns 200 `{ deleted, failed }` con el número de documentos borrados y fallidos
 * @throws 500 `misconfigured` si falta algún secreto de R2
 * @throws 500 `lookup_failed` si no se pudieron consultar los documentos
 * @throws 500 `row_delete_failed` si se borraron archivos pero no sus filas
 * @example
 * // Desde pg_cron:
 * select net.http_post(
 *   url := '<project_url>/functions/v1/hard-delete-documents',
 *   headers := jsonb_build_object('apikey', '<secret_key>')
 * );
 */
export default {
  fetch: withSupabase({ auth: "secret" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return errorResponse(405, "method_not_allowed", "Usa POST.");
    }

    const r2 = readR2Config();
    if (!r2) {
      console.error("Faltan secretos de R2 (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).");
      return errorResponse(500, "misconfigured", "La función no está configurada.");
    }

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: expired, error: lookupError } = await ctx.supabaseAdmin
      .from("documents")
      .select("id, file_path")
      .lt("deleted_at", cutoff)
      .returns<ExpiredDocument[]>();
    if (lookupError) {
      console.error("No se pudieron consultar los documentos:", lookupError);
      return errorResponse(500, "lookup_failed", "No se pudieron consultar los documentos.");
    }

    if (expired.length === 0) {
      return Response.json({ deleted: 0, failed: 0 }, { status: 200 });
    }

    const r2Client = createR2Client(r2);
    const deletedIds: string[] = [];

    for (const document of expired) {
      try {
        await r2Client.send(new DeleteObjectCommand({ Bucket: r2.bucket, Key: document.file_path }));
        deletedIds.push(document.id);
      } catch (error) {
        console.error(`No se pudo borrar ${document.file_path} (documento ${document.id}) de R2:`, error);
      }
    }

    const failed = expired.length - deletedIds.length;

    if (deletedIds.length > 0) {
      const { error: rowDeleteError } = await ctx.supabaseAdmin
        .from("documents")
        .delete()
        .in("id", deletedIds);
      if (rowDeleteError) {
        // Los archivos ya no existen; en la siguiente corrida R2 responde éxito
        // al borrarlos de nuevo y las filas se borran entonces.
        console.error("Se borraron archivos de R2 pero no sus filas:", rowDeleteError);
        return errorResponse(500, "row_delete_failed", "No se pudieron borrar los registros.");
      }
    }

    return Response.json({ deleted: deletedIds.length, failed }, { status: 200 });
  }),
};

/* Para invocar localmente:

  1. `npx supabase start` y `npx supabase functions serve hard-delete-documents`
  2. Secretos de R2 en `supabase/functions/.env` (usa el bucket de desarrollo).
  3. Con la secret key local:

  curl -i --request POST 'http://127.0.0.1:54321/functions/v1/hard-delete-documents' \
    --header 'apikey: <SECRET_KEY>'

*/
