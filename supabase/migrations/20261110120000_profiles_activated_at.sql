-- ——————————————————————————————————————————————————————————————
--   activated_at EN profiles: FECHA EN QUE EL USUARIO CREÓ SU
--             CONTRASEÑA POR PRIMERA VEZ
-- ——————————————————————————————————————————————————————————————

-- activated_at = null  → no ha activado su cuenta
-- activated_at = fecha → creó su contraseña (aceptó la invitación)
--
-- Solo lo escribe este trigger: `authenticated` únicamente tiene UPDATE sobre
-- las columnas de nombre, así que nadie puede marcarse como activado.

alter table public.profiles
    add column activated_at timestamptz;

create function public.handle_user_activated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.profiles
       set activated_at = now()
     where id = new.id;
    return new;
end;
$$;

-- Un usuario invitado no tiene contraseña (encrypted_password vacío o null).
-- El trigger solo se dispara cuando pasa de no tenerla a tenerla.
create trigger on_auth_user_activated
    after update of encrypted_password on auth.users
    for each row
    when (
        coalesce(old.encrypted_password, '') = ''
        and coalesce(new.encrypted_password, '') <> ''
    )
    execute function public.handle_user_activated();
