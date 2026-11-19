-- ———————————————————————————————————————————————
--       TITLE: DOCUMENT_AREAS TABLE CREATION
--      
-- ———————————————————————————————————————————————

CREATE TABLE document_areas (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  area_id     UUID REFERENCES areas(id)     ON DELETE CASCADE,
  PRIMARY KEY (document_id, area_id)
);

-- INDEX: RLS for document_areas
ALTER TABLE document_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_areas_select" ON document_areas
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "document_areas_insert" ON document_areas
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "document_areas_update" ON document_areas
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "document_areas_remove" ON document_areas
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));