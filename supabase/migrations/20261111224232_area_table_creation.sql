-- ———————————————————————————————————————————————
--     CREACIÓN DE TABLA AREAS JUNTO CON RLS
--  esta tabla simplement es el registro de areas
--  presentes en el sistema.
-- ———————————————————————————————————————————————

-- Table
CREATE TABLE areas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INDEX: RLS for table areas
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer áreas
CREATE POLICY "areas_select" ON areas
FOR SELECT TO authenticated
USING ((SELECT public.is_admin()));

-- Solo usarios dentreo de is_admin pueden crear/editar/borrar
CREATE POLICY "areas_insert" ON areas
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "areas_update" ON areas
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "areas_delete" ON areas
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));