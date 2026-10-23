-- ——————————————————————————————————————————————————————————————
-- Asignación del primer usuario admin
-- ——————————————————————————————————————————————————————————————
--
-- Requiere que el usuario ya exista en auth.users (creado desde el Dashboard:
-- Authentication → Users → Add user). Si no existe, la migración falla en vez
-- de marcarse como aplicada sin haber actualizado nada.

do $$
begin
    update public.profiles
    set nombre = 'Javier',
        apellido_paterno = 'Luis Castillo',
        apellido_materno = 'Solorzano',
        role = 'admin'
    where id = (select id from auth.users where email = 'lucaso.javier@gmail.com');

    if not found then
        raise exception 'No existe el usuario lucaso.javier@gmail.com en auth.users. Créalo desde el Dashboard antes de aplicar esta migración.';
    end if;
end;
$$;
