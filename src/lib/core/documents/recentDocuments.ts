import 'server-only';

import { cookies } from 'next/headers';

import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';

/**
 * Prefijo de la cookie con los ids de los documentos abiertos recientemente.
 * El nombre completo lleva el id del usuario (`soma_recent_docs_<userId>`):
 * cada usuario tiene su propia lista aunque compartan computadora.
 */
const RECENT_DOCUMENTS_COOKIE_PREFIX = 'soma_recent_docs_';

/** Cuántos documentos recientes se guardan. */
const MAX_RECENT_DOCUMENTS = 8;

/** Vida de la cookie: 90 días, en segundos. Se renueva cada vez que se abre un documento. */
const RECENT_DOCUMENTS_MAX_AGE = 60 * 60 * 24 * 90;

/** Forma de un UUID. La cookie la puede editar el usuario: lo que no cumpla se descarta. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Nombre de la cookie de recientes del usuario con sesión. El id sale del JWT
 * verificado (`getClaims`), no de un valor que mande el navegador, así que un
 * usuario no puede apuntar a la lista de otro.
 *
 * @returns el nombre de la cookie, o `null` si no hay sesión válida
 * @example
 * const cookieName = await getRecentDocumentsCookieName()
 */
async function getRecentDocumentsCookieName(): Promise<string | null> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();

    const userId = data?.claims.sub;
    if (error || !userId) return null;

    return `${RECENT_DOCUMENTS_COOKIE_PREFIX}${userId}`;
}

/**
 * Lee los ids guardados en una cookie de recientes. Si no existe, no es JSON
 * válido o trae valores que no son UUID, esos valores se ignoran.
 *
 * @param cookieName - nombre de la cookie del usuario
 * @returns hasta `MAX_RECENT_DOCUMENTS` ids, el más reciente primero
 * @example
 * const ids = await readRecentDocumentIds(cookieName)
 */
async function readRecentDocumentIds(cookieName: string): Promise<string[]> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(cookieName)?.value;
    if (!raw) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];

    return parsed
        .filter((value): value is string => typeof value === 'string' && UUID_PATTERN.test(value))
        .slice(0, MAX_RECENT_DOCUMENTS);
}

/**
 * Lee los ids de los documentos que el usuario con sesión abrió
 * recientemente en este navegador, del más reciente al más antiguo. La
 * cookie solo guarda ids: los datos se leen de la base
 * (`documentsProvider.getDocumentsByIds`), así que nunca quedan
 * desactualizados y RLS sigue decidiendo qué se ve.
 *
 * Nunca lanza error: sin sesión o con una cookie inválida regresa `[]`.
 *
 * @returns hasta `MAX_RECENT_DOCUMENTS` ids, el más reciente primero
 * @example
 * const ids = await getRecentDocumentIds()
 */
export async function getRecentDocumentIds(): Promise<string[]> {
    const cookieName = await getRecentDocumentsCookieName();
    if (!cookieName) return [];

    return readRecentDocumentIds(cookieName);
}

/**
 * Registra que el usuario con sesión abrió un documento: lo pone al inicio
 * de su lista de recientes, quita su aparición anterior y recorta la lista a
 * `MAX_RECENT_DOCUMENTS`. Sin sesión o con un id que no es UUID, no hace nada.
 *
 * Next solo permite escribir cookies en Server Actions y Route Handlers; no
 * se puede llamar desde un Server Component.
 *
 * @param documentId - id del documento que se abrió
 * @example
 * // dentro de una Server Action
 * await addRecentDocument(documentId)
 */
export async function addRecentDocument(documentId: string): Promise<void> {
    if (!UUID_PATTERN.test(documentId)) return;

    const cookieName = await getRecentDocumentsCookieName();
    if (!cookieName) return;

    const current = await readRecentDocumentIds(cookieName);
    const updated = [documentId, ...current.filter((id) => id !== documentId)]
        .slice(0, MAX_RECENT_DOCUMENTS);

    const cookieStore = await cookies();
    cookieStore.set(cookieName, JSON.stringify(updated), {
        httpOnly: true,                                  // el JavaScript del navegador no la lee
        secure: process.env.NODE_ENV === 'production',   // solo HTTPS en producción
        sameSite: 'lax',
        path: '/DMS',                                    // solo viaja en requests del DMS
        maxAge: RECENT_DOCUMENTS_MAX_AGE,
    });
}
