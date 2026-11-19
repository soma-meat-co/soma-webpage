--   ———————————————————————————————————————————————
-- INDEX: RPC PARA DEFINIR QUIEN PUEDE SUBIR ARCHIVOS
--  TODO: modificar el rls cuando cambie la politica
--   ——————————————————————————————————————————————

-- INDEX: RPC -> has_full_document_access
CREATE OR REPLACE FUNCTION public.has_full_document_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.is_admin();
$$;

REVOKE EXECUTE ON FUNCTION public.has_full_document_access() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_full_document_access() TO authenticated;

-- CREATE POLICY "documents_insert" ON documents
-- FOR INSERT TO authenticated
-- WITH CHECK ((SELECT public.is_admin()));

-- CREATE POLICY "documents_update" ON documents
-- FOR UPDATE TO authenticated
-- USING ((SELECT public.is_admin()));

-- CREATE POLICY "documents_delete" ON documents
-- FOR DELETE TO authenticated
-- USING ((SELECT public.is_admin()));