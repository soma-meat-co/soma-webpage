-- ———————————————————————————————————————————————
--     DEFAULT DE areas.created_by
--  `created_by` lo pone Postgres con el usuario de la sesión, así el
--  service no necesita consultar al usuario antes del insert.
-- ———————————————————————————————————————————————

ALTER TABLE public.areas
  ALTER COLUMN created_by SET DEFAULT auth.uid();
