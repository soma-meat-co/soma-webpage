-- ——————————————————————————————————————————————————————————————
-- Permiso de lectura sobre profiles para usuarios autenticados
-- ——————————————————————————————————————————————————————————————

-- El grant da acceso a la tabla; la política "profiles: leer propio" limita
-- ese acceso a la fila del propio usuario.
grant select on public.profiles to authenticated;
