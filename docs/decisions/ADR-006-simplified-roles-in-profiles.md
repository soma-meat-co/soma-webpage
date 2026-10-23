# ADR-006: Modelo de roles simplificado en `profiles`

- **Estado:** Aceptado
- **Fecha:** 2026-10-22
- **Autor:** Javier
- **Reemplaza parcialmente:** [ADR-004](./ADR-004-roles-and-access-control.md) (jerarquía de roles y tabla `user_roles`)

---

## Contexto

ADR-004 definió 4 roles fijos (`superadmin`, `global_admin`, `area_admin`, `user`) y una tabla `user_roles` que conecta usuario ↔ rol ↔ área.

Al iniciar la implementación de auth, la diferencia práctica entre los niveles de administración todavía no está definida, y aún no existe la tabla `areas`. Modelar 4 roles y una tabla de relación desde el inicio agrega complejidad sin un caso de uso concreto.

## Decisión

- El rol vive como columna en `public.profiles` (`role`), no en una tabla `user_roles`. Cada usuario tiene **un solo rol**.
- Los roles se definen como enum `public.app_role` con 3 valores:

```
user        → acceso por tag-matching (sin cambios respecto a ADR-004)
admin       → administración del sistema
superadmin  → reservado; su diferencia con admin está por definirse
```

- `profiles.area_id` queda como columna nullable, sin FK, hasta que exista la tabla `areas`.
- `role`, `area_id` y `created_by` no son editables por el rol `authenticated` (grant de UPDATE solo sobre columnas de nombre). Mientras no exista la función que valide la jerarquía, los roles solo se asignan como `postgres` o service role.
- El primer `admin` se asigna mediante la migración `bootstrap_admin`.

El tag-matching de ADR-004 se mantiene sin cambios.

## Razón

- Una columna en `profiles` es suficiente mientras cada usuario tenga un solo rol, y evita un join en cada validación de permisos.
- El enum hace que Postgres rechace roles inválidos y genera el tipo correspondiente en TypeScript.
- Definir menos roles ahora evita reglas de jerarquía que no tienen todavía un comportamiento claro.

## Consecuencias

- Agregar `global_admin` / `area_admin` en el futuro requiere `alter type ... add value` y una migración de datos.
- Si un usuario necesita administrar más de un área, este modelo no alcanza y habrá que volver a una tabla de relación (como `user_roles` de ADR-004) en un nuevo ADR.
- La regla "ningún actor asigna roles con más permisos que los propios" sigue vigente, pero ahora se valida sobre `profiles.role`, no en el insert a `user_roles`.
