-- ———————————————————————————————————————————————
--          INDEX: SOFT DELETE DE DOCUMENTOS
--      Al marcar como eliminado un documento,
--      este se pone con status deleted, folder
--      se cambia a null y deleted_by se actualiza.
--      Todo se maneja desde el RPC para que sea
--      una misma acción que haga todo y no
--      haya problemas después.
-- ———————————————————————————————————————————————

-- Errores que lanzan soft_delete_document() y restore_document():
--   42501  el usuario no es admin
--   P0002  el documento no existe
--   55000  el documento no está en el estado esperado
--          (ya eliminado al borrar / no eliminado al recuperar)

CREATE OR REPLACE FUNCTION public.soft_delete_document(p_document_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id    uuid := auth.uid();
    v_deleted_at timestamptz;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'No tienes los permisos necesarios para eliminar documentos.'
            USING ERRCODE = '42501';
    END IF;

    -- FOR UPDATE bloquea la fila hasta terminar, para que otra llamada
    -- no cambie su estado entre esta validación y el UPDATE.
    SELECT deleted_at INTO v_deleted_at
    FROM public.documents
    WHERE id = p_document_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El documento % no existe.', p_document_id
            USING ERRCODE = 'P0002';
    END IF;

    -- Si ya estaba eliminado no se toca, así no se reinicia el conteo
    -- de 30 días del hard delete.
    IF v_deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'El documento % ya está eliminado.', p_document_id
            USING ERRCODE = '55000';
    END IF;

    UPDATE public.documents
    SET
        deleted_at = now(),
        deleted_by = v_user_id,
        folder_id = NULL
    WHERE id = p_document_id;
END;
$$;

revoke all on function public.soft_delete_document(uuid) from public, anon;
grant execute on function public.soft_delete_document(uuid) to authenticated;

-- INDEX: Permisos por columna en documents
-- Un REVOKE por columna no tiene efecto si el rol tiene UPDATE sobre toda la
-- tabla (el default de Supabase). Por eso se quita el UPDATE de tabla y se
-- otorga solo sobre las columnas que el software edita directamente.
-- deleted_at y deleted_by quedan fuera: solo soft_delete_document() y
-- restore_document() las modifican.
-- RLS (documents_update con is_admin()) sigue aplicando sobre estas columnas.
REVOKE UPDATE ON public.documents FROM authenticated, anon;

GRANT UPDATE (
    name,
    description,
    folder_id,
    uploaded_at,  -- confirmación de subida (ADR-010)
    updated_at
) ON public.documents TO authenticated;

--------------------------------------------------------------------------
--------------------------------------------------------------------------

-- INDEX: RECUPERAR DOCUMENTOS
-- El documento vuelve sin folder (folder_id sigue en NULL); el admin le
-- asigna su ruta después (ADR-011).
CREATE OR REPLACE FUNCTION public.restore_document(p_document_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_deleted_at timestamptz;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'No tienes los permisos necesarios para recuperar documentos.'
            USING ERRCODE = '42501';
    END IF;

    SELECT deleted_at INTO v_deleted_at
    FROM public.documents
    WHERE id = p_document_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El documento % no existe.', p_document_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_deleted_at IS NULL THEN
        RAISE EXCEPTION 'El documento % no está eliminado.', p_document_id
            USING ERRCODE = '55000';
    END IF;

    UPDATE public.documents
    SET
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_document_id;
END;
$$;

revoke all on function public.restore_document(uuid) from public, anon;
grant execute on function public.restore_document(uuid) to authenticated;
