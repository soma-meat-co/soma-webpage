-- ———————————————————————————————————————————————
--     FK DE profiles.area_id HACIA areas
--  `profiles.area_id` se creó antes que `areas`, sin llave foránea. Sin ella,
--  borrar un área deja a sus usuarios con un `area_id` que no apunta a nada.
--  Con ON DELETE SET NULL, al borrar el área sus usuarios quedan sin área.
-- ———————————————————————————————————————————————

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_area_id_fkey
  FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE SET NULL;
