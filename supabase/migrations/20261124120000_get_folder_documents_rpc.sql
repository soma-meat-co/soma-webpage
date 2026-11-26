-- ———————————————————————————————————————————————
-- INDEX: RPC PARA LISTAR EL CONTENIDO DE UN FOLDER
--      Devuelve las subcarpetas y los documentos
--      directos de un folder (no baja a niveles
--      más profundos). p_folder_id NULL = raíz.
--      Forma del resultado = FolderElements:
--      { "folders": [...], "documents": [...] }
--      Cada folder y documento trae "tags": nombres
--      de sus áreas propias más las heredadas de la
--      carpeta actual y sus ancestros (ADR-011),
--      sin repetidos y ordenados.
--      "path": la carpeta actual y sus ancestros,
--      de la raíz hacia abajo ([{ id, folder_name }]).
--      Vacío en la raíz o si la carpeta no existe.
--
--      Errores:
--        42501 -> quien llama no tiene acceso a documentos
-- ———————————————————————————————————————————————

-- INDEX: RPC -> can_access_documents
-- Única fuente de verdad de quién puede leer documentos y carpetas.
-- Cuando cambie la política de lectura, se modifica solo esta función.
-- Fase 1 (ADR-008 / ADR-011): cualquier usuario con sesión tiene acceso.
-- TODO(ADR-011): restringir lectura (readable_folder_ids() y herencia de áreas).
CREATE OR REPLACE FUNCTION public.can_access_documents()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT auth.uid() IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.can_access_documents() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_access_documents() TO authenticated;


-- INDEX: RPC -> get_folder_documents
-- SECURITY INVOKER: corre con la sesión de quien llama, así que además del
-- chequeo de can_access_documents() aplica RLS de folders y documents.
CREATE OR REPLACE FUNCTION public.get_folder_documents(p_folder_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_folder_ids     uuid[];
    v_document_ids   uuid[];
    -- Áreas que la carpeta actual y sus ancestros heredan a todo su contenido.
    v_inherited_tags text[] := '{}';
    -- Carpeta actual y ancestros, de la raíz hacia abajo (breadcrumb).
    v_path           jsonb  := '[]'::jsonb;
    v_folders        jsonb;
    v_documents      jsonb;
BEGIN
    IF NOT public.can_access_documents() THEN
        RAISE EXCEPTION 'Sin acceso a documentos'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- 1. Qué folders y documentos son hijos directos.
    -- La raíz y un folder concreto van en ramas separadas para que Postgres use
    -- los índices: `IS NULL` y `=` sí los usan; `IS NOT DISTINCT FROM` no.
    -- Índices: UNIQUE (parent_id, folder_name) y documents_folder_id_idx.
    IF p_folder_id IS NULL THEN
        SELECT array_agg(id) INTO v_folder_ids
        FROM public.folders
        WHERE parent_id IS NULL;

        SELECT array_agg(id) INTO v_document_ids
        FROM public.documents
        WHERE folder_id IS NULL
          AND deleted_at IS NULL        -- sin soft delete
          AND uploaded_at IS NOT NULL;  -- subida confirmada
        -- En la raíz no hay nada que heredar ni ruta: v_inherited_tags y
        -- v_path se quedan vacíos.
    ELSE
        SELECT array_agg(id) INTO v_folder_ids
        FROM public.folders
        WHERE parent_id = p_folder_id;

        SELECT array_agg(id) INTO v_document_ids
        FROM public.documents
        WHERE folder_id = p_folder_id
          AND deleted_at IS NULL        -- sin soft delete
          AND uploaded_at IS NOT NULL;  -- subida confirmada

        -- 2. Ruta y áreas heredadas: se recorren la carpeta actual y todos sus
        -- ancestros. `depth` cuenta niveles hacia arriba (0 = carpeta actual)
        -- y sirve para ordenar la ruta de la raíz hacia abajo.
        -- Como `depth` cambia en cada nivel, UNION ya no detendría un ciclo;
        -- la cláusula CYCLE lo hace: marca la fila repetida y corta ahí.
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id, folder_name, 0 AS depth
            FROM public.folders
            WHERE id = p_folder_id

            UNION ALL

            SELECT parent_folder.id, parent_folder.parent_id, parent_folder.folder_name, ancestors.depth + 1
            FROM public.folders AS parent_folder
            JOIN ancestors ON parent_folder.id = ancestors.parent_id
        ) CYCLE id SET is_cycle USING visited_ids
        SELECT
            COALESCE(
                jsonb_agg(
                    jsonb_build_object('id', ancestors.id, 'folder_name', ancestors.folder_name)
                    ORDER BY ancestors.depth DESC
                ),
                '[]'::jsonb
            ),
            (
                SELECT COALESCE(array_agg(DISTINCT area.name), '{}')
                FROM public.folder_areas AS folder_area
                JOIN public.areas AS area ON area.id = folder_area.area_id
                WHERE folder_area.folder_id IN (SELECT id FROM ancestors WHERE NOT is_cycle)
            )
        INTO v_path, v_inherited_tags
        FROM ancestors
        WHERE NOT ancestors.is_cycle;
    END IF;

    -- 3. Armar el JSON. Los tags de cada elemento son sus áreas propias UNION
    -- las heredadas; UNION quita repetidos (ej. la misma área propia y heredada).
    -- `id = ANY(...)` usa la llave primaria.
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',          child_folder.id,
                'folder_name', child_folder.folder_name,
                'parent_id',   child_folder.parent_id,
                'tags',        to_jsonb(ARRAY(
                    SELECT tag FROM (
                        SELECT area.name AS tag
                        FROM public.folder_areas AS folder_area
                        JOIN public.areas AS area ON area.id = folder_area.area_id
                        WHERE folder_area.folder_id = child_folder.id

                        UNION

                        SELECT unnest(v_inherited_tags)
                    ) AS folder_tags
                    ORDER BY tag
                ))
            )
            ORDER BY child_folder.folder_name
        ),
        '[]'::jsonb
    )
    INTO v_folders
    FROM public.folders AS child_folder
    WHERE child_folder.id = ANY(v_folder_ids);

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id',          document.id,
                'name',        document.name,
                'description', document.description,
                'file_type',   document.file_type,
                'file_size',   document.file_size,
                'uploaded_at', document.uploaded_at,
                'folder_id',   document.folder_id,
                'tags',        to_jsonb(ARRAY(
                    SELECT tag FROM (
                        SELECT area.name AS tag
                        FROM public.document_areas AS document_area
                        JOIN public.areas AS area ON area.id = document_area.area_id
                        WHERE document_area.document_id = document.id

                        UNION

                        SELECT unnest(v_inherited_tags)
                    ) AS document_tags
                    ORDER BY tag
                ))
            )
            ORDER BY document.name
        ),
        '[]'::jsonb
    )
    INTO v_documents
    FROM public.documents AS document
    WHERE document.id = ANY(v_document_ids);

    RETURN jsonb_build_object(
        'path',      v_path,
        'folders',   v_folders,
        'documents', v_documents
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_folder_documents(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_folder_documents(uuid) TO authenticated;
