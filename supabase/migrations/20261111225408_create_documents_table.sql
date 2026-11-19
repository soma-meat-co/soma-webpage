-- ———————————————————————————————————————————————
--      TITLE: CREACIÓN DE TABLA DOCUMENTS
-- Creación de la tabla con rls minimo para authenticated.
--        Se agregan rls específico en futuro.
-- ———————————————————————————————————————————————

-- INDEX: Documents Table Creation
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,  -- key en R2. Se calcula en el servidor antes del insert (ADR-010)
  file_type   TEXT NOT NULL,  -- MIME de file type
  file_size   BIGINT NOT NULL, -- bytes
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NULL, -- NULL = subida pendiente de confirmar (ADR-010)
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ DEFAULT NULL, -- columna para soft delete. Agregaremos trigger para eliminarlos completamente despues de x dias. Por definir.
  deleted_by UUID REFERENCES auth.users(id)
);

-- INDEX: RLS for Documents
-- Fase 1 (ADR-008): lectura para authenticated, escritura solo is_admin().
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON documents
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "documents_insert" ON documents
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "documents_update" ON documents
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "documents_delete" ON documents
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- TODO: MANEJO DE PERMISOS ESPECIFICOS YA QU EXISTA USER_ACCESS TABLE.

-- INDEX: Hard-delete on Documents.
-- El cron no borra filas: llama a la Edge Function `hard-delete-documents`, que
-- borra el archivo en R2 y después la fila. La retención (30 días) vive en la función.
-- Requiere en Vault: `project_url` y `secret_key` (no se crean aquí para no
-- dejar secretos en el repo).
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.schedule(
  'hard-delete-documents',
  '0 2 * * *',  -- cada día a las 2am (UTC)
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
             || '/functions/v1/hard-delete-documents',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'secret_key')
      ),
      timeout_milliseconds := 30000
    );
  $$
);