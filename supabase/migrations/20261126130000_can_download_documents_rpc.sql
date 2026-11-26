-- ———————————————————————————————————————————————
-- INDEX: PERMISO DE DESCARGA
--      Descargar un documento (attachment) es un
--      permiso aparte de verlo. El botón en la UI
--      solo se esconde; quien bloquea de verdad es
--      access_document() (20261126140000), que llama
--      a esta función antes de que Next firme la URL.
--      Ver ADR-012.
-- ———————————————————————————————————————————————

-- INDEX: RPC -> can_download_documents
-- Única fuente de verdad de quién puede descargar documentos.
-- Fase 1: solo admin. Si después se abre a otros roles, áreas o a un permiso
-- por documento (allow_download, ADR-009), se cambia solo esta función.
CREATE OR REPLACE FUNCTION public.can_download_documents()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT public.is_admin();
$$;

REVOKE EXECUTE ON FUNCTION public.can_download_documents() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.can_download_documents() TO authenticated;
