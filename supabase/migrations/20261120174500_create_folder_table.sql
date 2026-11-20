-- ———————————————————————————————————————————————
-- INDEX: TABLA DE FOLDERS PARA MANEJO DE CARPETAS
--      Se manejan las rutas de los documentos
--      con tabla de folders recursiva en donde
--      se guarda el parent folder del folder
--      para rutas especificas.
-- ———————————————————————————————————————————————

CREATE TABLE IF NOT EXISTS folders(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- no permite eliminar una carpeta con folders hijos.
    parent_id   UUID REFERENCES folders(id) ON DELETE RESTRICT,
    folder_name text NOT NULL,
    created_by  UUID DEFAULT auth.uid() REFERENCES auth.users(id),

    UNIQUE NULLS NOT DISTINCT (parent_id, folder_name),

    CONSTRAINT folders_no_self_parent CHECK (parent_id IS DISTINCT FROM id)
);

CREATE TABLE IF NOT EXISTS folder_areas (
    folder_id   UUID REFERENCES folders(id) ON DELETE CASCADE,
    area_id     UUID REFERENCES areas(id) ON DELETE CASCADE,
    PRIMARY KEY (folder_id, area_id)
);

ALTER TABLE documents
    ADD COLUMN folder_id  UUID REFERENCES folders(id) ON DELETE RESTRICT;

-- INDEX: Prevención de ciclos entre folders (ADR-011)
-- Un ciclo solo se crea al mover un folder (UPDATE de parent_id). Se recorren
-- los ancestros del nuevo padre; si el folder que se mueve aparece entre
-- ellos, el movimiento crearía un ciclo y se rechaza.
-- UNION (no UNION ALL) garantiza que el recorrido termine aunque exista un ciclo previo.
CREATE OR REPLACE FUNCTION public.prevent_folder_cycle()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Mover a la raíz (parent_id nulo) nunca crea un ciclo: se permite sin validar.
    -- El caso en que parent_id no cambia ya lo filtra el WHEN del trigger.
    IF NEW.parent_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Serializa los movimientos de folders: si otro admin está moviendo un folder,
    -- se espera a que su transacción termine. El lock se libera solo al terminar
    -- la transacción (commit o rollback). Así la consulta de abajo ve el árbol
    -- ya actualizado y dos movimientos cruzados no pueden pasar ambos la validación.
    PERFORM pg_advisory_xact_lock(hashtext('public.folders.move'));

    IF EXISTS (
        -- tabla temporal
        WITH RECURSIVE ancestors AS (
            SELECT id, parent_id
            FROM public.folders
            WHERE id = NEW.parent_id
            
            -- recursividad
            UNION

            SELECT parent_folder.id, parent_folder.parent_id
            FROM public.folders AS parent_folder
            JOIN ancestors ON parent_folder.id = ancestors.parent_id
        )
        -- si id de ancestors existe ya en un ancestro recorrido existe un ciclo
        SELECT 1 FROM ancestors WHERE id = NEW.id
    ) THEN
        RAISE EXCEPTION 'No se puede mover el folder % dentro de uno de sus subfolders', NEW.id
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER folders_prevent_cycle
BEFORE UPDATE OF parent_id ON folders
FOR EACH ROW
WHEN (NEW.parent_id IS DISTINCT FROM OLD.parent_id)
EXECUTE FUNCTION public.prevent_folder_cycle();


-- INDEX: RLS for folders
-- Fase 1 (ADR-008 / ADR-011): lectura para authenticated, escritura solo is_admin().
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folders_select" ON folders
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "folders_insert" ON folders
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "folders_update" ON folders
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "folders_delete" ON folders
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- INDEX: RLS for folder_areas
ALTER TABLE folder_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folder_areas_select" ON folder_areas
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "folder_areas_insert" ON folder_areas
FOR INSERT TO authenticated
WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "folder_areas_update" ON folder_areas
FOR UPDATE TO authenticated
USING ((SELECT public.is_admin()));

CREATE POLICY "folder_areas_delete" ON folder_areas
FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));
