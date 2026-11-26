import { AppError } from './base';

/** Error listo para mostrar en la UI o regresar desde una server action. */
export interface HandledError {
    /** Código estable del error (`AppError.code`) o `UNEXPECTED_ERROR`. */
    code: string;
    /** Mensaje seguro para el usuario; nunca trae detalles técnicos. */
    message: string;
}

/** Código para errores que no son `AppError` (bugs o fallas no previstas). */
export const UNEXPECTED_ERROR_CODE = 'UNEXPECTED_ERROR';

/** Mensaje para el usuario cuando el error no es un `AppError`. */
const UNEXPECTED_ERROR_MESSAGE = 'Ocurrió un error inesperado. Intenta más tarde.';

/**
 * Registra un error atrapado en un `catch` y lo convierte en algo que se puede
 * mostrar al usuario. Va en el `catch` de quien maneja el error (server
 * actions, páginas), no en el constructor de `AppError`: ahí se conoce el
 * contexto y se sabe que el error de verdad terminó ahí.
 *
 * - `AppError`: registra `code`, `statusCode` y `detail`. Los 4xx van con
 *   `console.warn` (comportamiento esperado: duplicado, no encontrado, sin
 *   permiso); los 5xx con `console.error`. Devuelve su `genericMessage`.
 * - Cualquier otro error: registra el error completo con `console.error` y
 *   devuelve un mensaje genérico.
 *
 * @param context - quién atrapó el error, para los logs (ej. `'uploadDocument'`)
 * @param err - lo que llegó al `catch`
 * @returns `code` y `message` para la UI
 * @example
 * try {
 *     await documentsProvider.confirmUpload(id)
 *     return { ok: true }
 * } catch (err) {
 *     return { ok: false, ...handleError('confirmUploadedDocument', err) }
 * }
 */
export function handleError(context: string, err: unknown): HandledError {
    if (err instanceof AppError) {
        const log = err.statusCode >= 500 ? console.error : console.warn;
        log(`[${context}] ${err.code} (${err.statusCode}): ${err.detail}`);
        return { code: err.code, message: err.genericMessage };
    }

    console.error(`[${context}] error inesperado:`, err);
    return { code: UNEXPECTED_ERROR_CODE, message: UNEXPECTED_ERROR_MESSAGE };
}
