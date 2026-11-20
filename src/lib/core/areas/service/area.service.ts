import 'server-only';

import { createSupabaseServerClient } from '@/lib/core/auth/serverClient';
import type { Area, AreasProvider } from '../provider/areas.provider';

// INDEX: Error imports
import { AccessError, AccessErrorCode } from '@/lib/errors/access';
import { AreaError, AreaErrorCode } from '@/lib/errors/areas';

/**
 * Código de Postgres para permisos insuficientes: una política de RLS rechazó
 * un INSERT, o al rol le falta el GRANT sobre la tabla.
 */
const INSUFFICIENT_PRIVILEGE = '42501';

/** Código de Postgres cuando se repite una llave única (aquí, `areas.name`). */
const UNIQUE_VIOLATION = '23505';

/**
 * Error para un `42501`. El detalle nombra la operación para que en los logs
 * se vea de inmediato que fue un problema de permisos (p. ej. un componente
 * fuera de `/admin` llamando una operación de admin).
 *
 * @param action - nombre de la operación
 * @param message - `error.message` de Postgres
 * @returns el `AccessError` listo para lanzar
 * @example
 * if (error.code === INSUFFICIENT_PRIVILEGE) throw insufficientPrivilege('createNewArea', error.message)
 */
function insufficientPrivilege(action: string, message: string): AccessError {
    return new AccessError(
        AccessErrorCode.AuthorizationFailure,
        `${action}: permisos insuficientes en "areas" (42501). ¿Se llamó sin sesión de admin? ${message}`,
        'No cuentas con los permisos necesarios para esta acción.',
        403,
    );
}

/**
 * Implementación de {@link AreasProvider} sobre Supabase. Los permisos los
 * decide RLS (`is_admin()` en todas las operaciones de `areas`).
 */
class SupabaseAreasService implements AreasProvider {
    /**
     * Inserta un área. `created_by` lo pone Postgres (`DEFAULT auth.uid()`).
     *
     * @param areaName - nombre del área; único en la tabla
     * @throws {AccessError} `AuthorizationFailure` si RLS rechaza el insert
     *   (no es admin o no hay sesión)
     * @throws {AreaError} `CreateFailed` si el nombre ya existe o el insert
     *   falló por otra razón
     * @example
     * await areasProvider.createNewArea('Marketing')
     */
    async createNewArea(areaName: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { error } = await supabase.from('areas').insert({ name: areaName });

        if (!error) return;

        if (error.code === INSUFFICIENT_PRIVILEGE) {
            throw insufficientPrivilege('createNewArea', error.message);
        }
        if (error.code === UNIQUE_VIOLATION) {
            throw new AreaError(
                AreaErrorCode.CreateFailed,
                `Nombre de área duplicado: "${areaName}"`,
                'Ya existe un área con ese nombre.',
                409,
            );
        }
        throw new AreaError(
            AreaErrorCode.CreateFailed,
            `No se pudo crear el área "${areaName}": ${error.message}`,
            'Ocurrió un error inesperado. Intenta más tarde.',
            500,
        );
    }

    /**
     * Cambia el nombre de un área. En un UPDATE, RLS no da error: si el
     * usuario no es admin la fila se filtra y se actualizan 0 filas. Por eso se
     * pide la fila de vuelta (`.select('id')`) y 0 filas cuenta como fallo.
     *
     * @param uuid - `id` del área
     * @param newAreaName - nombre nuevo; único en la tabla
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {AreaError} `UpdateFailed` si el nombre ya existe, si no se
     *   actualizó ninguna fila (no existe o RLS la filtró) o por otro error
     * @example
     * await areasProvider.editArea(areaId, 'Ventas')
     */
    async editArea(uuid: string, newAreaName: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('areas')
            .update({ name: newAreaName })
            .eq('id', uuid)
            .select('id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('editArea', error.message);
            }
            if (error.code === UNIQUE_VIOLATION) {
                throw new AreaError(
                    AreaErrorCode.UpdateFailed,
                    `Nombre de área duplicado: "${newAreaName}"`,
                    'Ya existe un área con ese nombre.',
                    409,
                );
            }
            throw new AreaError(
                AreaErrorCode.UpdateFailed,
                `No se pudo editar el área ${uuid}: ${error.message}`,
                'Ocurrió un error inesperado. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new AreaError(
                AreaErrorCode.UpdateFailed,
                `UPDATE de área ${uuid} afectó 0 filas: no existe o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró el área o no tienes permisos para editarla.',
                404,
            );
        }
    }

    /**
     * Borra un área. Sus filas en `document_areas` se borran en cascada y los
     * `profiles` que la tenían quedan con `area_id = NULL`. Igual que en
     * `editArea`, RLS no da error en un DELETE: 0 filas borradas cuenta como
     * fallo.
     *
     * @param uuid - `id` del área
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {AreaError} `DeleteFailed` si no se borró ninguna fila (no existe
     *   o RLS la filtró) o por otro error
     * @example
     * await areasProvider.deleteArea(areaId)
     */
    async deleteArea(uuid: string): Promise<void> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('areas')
            .delete()
            .eq('id', uuid)
            .select('id');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('deleteArea', error.message);
            }
            throw new AreaError(
                AreaErrorCode.DeleteFailed,
                `No se pudo borrar el área ${uuid}: ${error.message}`,
                'Ocurrió un error inesperado. Intenta más tarde.',
                500,
            );
        }

        if (data.length === 0) {
            throw new AreaError(
                AreaErrorCode.DeleteFailed,
                `DELETE de área ${uuid} afectó 0 filas: no existe o RLS la filtró (¿usuario sin admin?).`,
                'No se encontró el área o no tienes permisos para borrarla.',
                404,
            );
        }
    }

    /**
     * Lista las áreas que RLS deja ver, ordenadas por nombre (A→Z). Un usuario
     * sin permiso recibe una lista vacía, no un error.
     *
     * @returns `id` y `name` de cada área visible
     * @throws {AccessError} `AuthorizationFailure` si Postgres responde `42501`
     * @throws {AreaError} `FetchFailed` si la consulta falló por otra razón
     * @example
     * const areas = await areasProvider.fetchAllAreas()
     */
    async fetchAllAreas(): Promise<Area[]> {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from('areas')
            .select('id, name')
            .order('name');

        if (error) {
            if (error.code === INSUFFICIENT_PRIVILEGE) {
                throw insufficientPrivilege('fetchAllAreas', error.message);
            }
            throw new AreaError(
                AreaErrorCode.FetchFailed,
                `No se pudieron obtener las áreas: ${error.message}`,
                'No se pudieron cargar las áreas. Intenta más tarde.',
                500,
            );
        }
        return data;
    }
}

export const areasProvider: AreasProvider = new SupabaseAreasService();
