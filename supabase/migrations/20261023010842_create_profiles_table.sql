-- ——————————————————————————————————————————————————————————————
-- Creación de tabla profiles y trigger tras creación de usuario
-- ——————————————————————————————————————————————————————————————


create type public.app_role as enum ('user', 'admin', 'superadmin');

create table public.profiles(
    id uuid primary key references auth.users(id) on delete cascade,
    nombre text,
    apellido_paterno text,
    apellido_materno text,
    role public.app_role not null default 'user',
    area_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    created_by uuid references public.profiles(id) on delete set null
);

--
-- INDEX: POLITICAS DE RLS
alter table public.profiles enable row level security;

create policy "profiles: leer propio"
    on public.profiles for select
    to authenticated
    using ((select auth.uid()) = id);

create policy "profiles: actualizar propio"
    on public.profiles for update
    to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

-- Supabase otorga UPDATE sobre toda la tabla a `authenticated`; un revoke por
-- columna no tiene efecto mientras exista ese grant. Se quita el grant de tabla
-- y se otorga solo sobre las columnas que el usuario puede editar.
revoke update on public.profiles from authenticated;
grant update (nombre, apellido_paterno, apellido_materno) on public.profiles to authenticated;

--
-- INDEX: trigger para crear un usuario en profiles cada que se crea un nuevo usuario
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, nombre, apellido_paterno, apellido_materno)
    values (
        new.id,
        new.raw_user_meta_data ->> 'nombre',
        new.raw_user_meta_data ->> 'apellido_paterno',
        new.raw_user_meta_data ->> 'apellido_materno'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
