-- ———————————————————————————————————————————————
-- INDEX: RPCs PARA EDITAR CARPETAS Y DOCUMENTOS
--      "Editar" cambia en una sola llamada el nombre,
--      la ubicación y las áreas propias (tags) de una
--      carpeta o un documento. Todo en una transacción:
--      si algo falla (nombre duplicado, ciclo, área que
--      no existe), no se guarda nada.
--
--      SECURITY INVOKER: corren con la sesión de quien
--      llama, así que las políticas de RLS (`is_admin()`)
--      siguen aplicando. El chequeo explícito de
--      `is_admin()` está porque, en un UPDATE, RLS no da
--      error: solo filtra la fila, y eso se vería como
--      "no existe".
--
--      p_area_ids es la lista COMPLETA de áreas propias:
--      las que no vengan se quitan y las nuevas se
--      agregan. Las heredadas (ADR-011) no se tocan.
--
--      Errores:
--        42501 -> quien llama no es admin
--        P0002 -> la carpeta/documento no existe (o el documento está eliminado)
--        23505 -> ya existe una carpeta con ese nombre en el destino
--        23514 -> mover la carpeta dentro de sí misma o de una subcarpeta
--        23503 -> la carpeta destino o un área no existen
-- ———————————————————————————————————————————————

-- INDEX: RPC -> update_folder
CREATE OR REPLACE FUNCTION public.update_folder(
    p_folder_id   uuid,
    p_folder_name text,
    p_parent_id   uuid,
    p_area_ids    uuid[]
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo admin puede editar carpetas'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- El CHECK folders_no_self_parent y el trigger folders_prevent_cycle
    -- rechazan ciclos; el UNIQUE (parent_id, folder_name) rechaza duplicados.
    UPDATE public.folders
    SET folder_name = p_folder_name,
        parent_id   = p_parent_id
    WHERE id = p_folder_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe la carpeta %', p_folder_id
            USING ERRCODE = 'no_data_found';
    END IF;

    DELETE FROM public.folder_areas
    WHERE folder_id = p_folder_id
      AND area_id <> ALL(COALESCE(p_area_ids, '{}'));

    INSERT INTO public.folder_areas (folder_id, area_id)
    SELECT p_folder_id, area_id
    FROM unnest(COALESCE(p_area_ids, '{}')) AS area_id
    ON CONFLICT DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_folder(uuid, text, uuid, uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_folder(uuid, text, uuid, uuid[]) TO authenticated;


-- INDEX: RPC -> update_document
-- Un documento con soft delete no se edita: primero hay que recuperarlo (ADR-011).
CREATE OR REPLACE FUNCTION public.update_document(
    p_document_id uuid,
    p_name        text,
    p_folder_id   uuid,
    p_area_ids    uuid[]
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo admin puede editar documentos'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    UPDATE public.documents
    SET name       = p_name,
        folder_id  = p_folder_id,
        updated_at = now()
    WHERE id = p_document_id
      AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el documento % o está eliminado', p_document_id
            USING ERRCODE = 'no_data_found';
    END IF;

    DELETE FROM public.document_areas
    WHERE document_id = p_document_id
      AND area_id <> ALL(COALESCE(p_area_ids, '{}'));

    INSERT INTO public.document_areas (document_id, area_id)
    SELECT p_document_id, area_id
    FROM unnest(COALESCE(p_area_ids, '{}')) AS area_id
    ON CONFLICT DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_document(uuid, text, uuid, uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_document(uuid, text, uuid, uuid[]) TO authenticated;
