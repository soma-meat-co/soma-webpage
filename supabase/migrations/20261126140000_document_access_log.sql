-- ———————————————————————————————————————————————
-- INDEX: BITÁCORA DE ACCESOS A DOCUMENTOS
--      Una sola tabla para vistas y descargas
--      (columna access_type), no dos tablas.
--      Ver ADR-009 (origen) y ADR-012 (cambios).
--
--      Nadie escribe en la tabla directamente: solo
--      access_document(), que en una sola llamada
--      valida el permiso, lee el documento y
--      registra el acceso. Si el registro falla,
--      falla todo y Next no firma la URL.
--
--      Errores de access_document:
--        42501 -> sin permiso para ese tipo de acceso
--        22023 -> access_type inválido
-- ———————————————————————————————————————————————

-- INDEX: Tabla document_access_log
CREATE TABLE public.document_access_log (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- Sin FK a propósito: el hard delete borra la fila de documents y el
    -- registro debe sobrevivir con el id intacto (con SET NULL se perdería).
    document_id   UUID        NOT NULL,
    -- Copia del nombre al momento del acceso: dice qué documento era aunque
    -- después lo renombren o lo borren.
    document_name TEXT        NOT NULL,
    -- Sin FK por la misma razón: el historial no depende de que el usuario siga existiendo.
    user_id       UUID        NOT NULL,
    access_type   TEXT        NOT NULL CHECK (access_type IN ('view', 'download')),
    accessed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.document_access_log IS
    'Bitácora inmutable de vistas y descargas. Solo escribe access_document(). Ver ADR-012.';

-- INDEX: Índices para las consultas de auditoría
-- "¿Quién abrió este documento?" y "¿Qué abrió este usuario?", del más reciente al más antiguo.
CREATE INDEX document_access_log_document_idx ON public.document_access_log (document_id, accessed_at DESC);
CREATE INDEX document_access_log_user_idx     ON public.document_access_log (user_id, accessed_at DESC);

-- INDEX: RLS y permisos
-- Solo admin lee. No hay políticas de INSERT, UPDATE ni DELETE y además se
-- quitan los privilegios: ni con RLS mal configurado se puede escribir,
-- editar o borrar desde la API. El registro es inmutable.
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.document_access_log FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON public.document_access_log TO authenticated;

CREATE POLICY "document_access_log_select" ON public.document_access_log
FOR SELECT TO authenticated
USING ((SELECT public.is_admin()));


-- INDEX: RPC -> access_document
-- Valida el permiso según el tipo de acceso, lee el documento y registra el
-- acceso, todo en la misma transacción. Regresa lo necesario para firmar la
-- URL. 0 filas = no existe, está eliminado o no terminó de subirse (no se
-- registra nada).
--
-- SECURITY DEFINER: es la única forma de insertar en la bitácora sin dar
-- INSERT a authenticated (con INSERT, un usuario podría registrar accesos
-- falsos o llenar la tabla). Por eso no aplica el RLS de documents y el
-- permiso se valida aquí con can_access_documents() / can_download_documents().
-- TODO(ADR-011): cuando la lectura se restrinja por áreas, validar aquí que el
-- usuario puede leer ESTE documento, con la misma lógica que readable_folder_ids().
CREATE OR REPLACE FUNCTION public.access_document(p_document_id uuid, p_access_type text)
RETURNS TABLE (name text, file_path text, file_type text)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_name      text;
    v_file_path text;
    v_file_type text;
BEGIN
    IF p_access_type = 'view' THEN
        IF NOT public.can_access_documents() THEN
            RAISE EXCEPTION 'Sin acceso a documentos'
                USING ERRCODE = 'insufficient_privilege';
        END IF;
    ELSIF p_access_type = 'download' THEN
        IF NOT public.can_download_documents() THEN
            RAISE EXCEPTION 'Sin permiso para descargar documentos'
                USING ERRCODE = 'insufficient_privilege';
        END IF;
    ELSE
        RAISE EXCEPTION 'access_type inválido: %', p_access_type
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    SELECT document.name, document.file_path, document.file_type
    INTO v_name, v_file_path, v_file_type
    FROM public.documents AS document
    WHERE document.id = p_document_id
      AND document.deleted_at IS NULL        -- sin soft delete
      AND document.uploaded_at IS NOT NULL;  -- subida confirmada

    IF NOT FOUND THEN
        RETURN;
    END IF;

    INSERT INTO public.document_access_log (document_id, document_name, user_id, access_type)
    VALUES (p_document_id, v_name, auth.uid(), p_access_type);

    RETURN QUERY SELECT v_name, v_file_path, v_file_type;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.access_document(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.access_document(uuid, text) TO authenticated;
