-- ———————————————————————————————————————————————
-- INDEX: RPC PARA LEER DOCUMENTOS POR ID
--      Devuelve los documentos de una lista de ids,
--      en el mismo orden de la lista. Lo usa
--      "Documentos recientes": la cookie guarda solo
--      ids y aquí se leen los datos actuales.
--      Forma de cada elemento = FolderDocument
--      (igual que en get_folder_documents), con
--      "tags": áreas propias más las heredadas de su
--      carpeta y sus ancestros (ADR-011).
--      Los ids que no existen, tienen soft delete,
--      no terminaron de subirse o RLS no deja leer
--      simplemente no aparecen.
--
--      Errores:
--        42501 -> quien llama no tiene acceso a documentos
-- ———————————————————————————————————————————————

-- INDEX: RPC -> get_documents_by_ids
-- SECURITY INVOKER: además de can_access_documents() aplica el RLS de
-- documents, folders, folder_areas, document_areas y areas.
CREATE OR REPLACE FUNCTION public.get_documents_by_ids(p_document_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_documents jsonb;
BEGIN
    IF NOT public.can_access_documents() THEN
        RAISE EXCEPTION 'Sin acceso a documentos'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    WITH RECURSIVE requested AS (
        -- WITH ORDINALITY numera los ids en el orden en que llegaron, para
        -- regresar los documentos en ese mismo orden (el más reciente primero).
        -- El join con la llave primaria descarta los ids que no existen.
        SELECT
            document.id,
            document.name,
            document.description,
            document.file_type,
            document.file_size,
            document.uploaded_at,
            document.folder_id,
            requested_id.sort_order
        FROM unnest(p_document_ids) WITH ORDINALITY AS requested_id(id, sort_order)
        JOIN public.documents AS document ON document.id = requested_id.id
        WHERE document.deleted_at IS NULL        -- sin soft delete
          AND document.uploaded_at IS NOT NULL   -- subida confirmada
    ),
    -- Cada carpeta de los documentos pedidos y todos sus ancestros.
    -- `origin_id` recuerda de qué carpeta salió cada cadena, para saber qué
    -- áreas hereda cada documento. CYCLE corta si hubiera un ciclo.
    folder_chain AS (
        SELECT folder.id AS origin_id, folder.id, folder.parent_id
        FROM public.folders AS folder
        WHERE folder.id IN (SELECT folder_id FROM requested)

        UNION ALL

        SELECT folder_chain.origin_id, parent_folder.id, parent_folder.parent_id
        FROM public.folders AS parent_folder
        JOIN folder_chain ON parent_folder.id = folder_chain.parent_id
    ) CYCLE id SET is_cycle USING visited_ids
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',          requested.id,
                'name',        requested.name,
                'description', requested.description,
                'file_type',   requested.file_type,
                'file_size',   requested.file_size,
                'uploaded_at', requested.uploaded_at,
                'folder_id',   requested.folder_id,
                'tags',        to_jsonb(ARRAY(
                    SELECT tag FROM (
                        -- Áreas propias del documento.
                        SELECT area.name AS tag
                        FROM public.document_areas AS document_area
                        JOIN public.areas AS area ON area.id = document_area.area_id
                        WHERE document_area.document_id = requested.id

                        UNION

                        -- Áreas heredadas de su carpeta y ancestros. Un
                        -- documento sin carpeta no tiene cadena: no hereda nada.
                        SELECT area.name
                        FROM folder_chain
                        JOIN public.folder_areas AS folder_area ON folder_area.folder_id = folder_chain.id
                        JOIN public.areas AS area ON area.id = folder_area.area_id
                        WHERE folder_chain.origin_id = requested.folder_id
                          AND NOT folder_chain.is_cycle
                    ) AS document_tags
                    ORDER BY tag
                ))
            )
            ORDER BY requested.sort_order
        ),
        '[]'::jsonb
    )
    INTO v_documents
    FROM requested;

    RETURN v_documents;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_documents_by_ids(uuid[]) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_documents_by_ids(uuid[]) TO authenticated;
