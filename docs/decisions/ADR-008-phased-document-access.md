# ADR-008: Acceso a documentos por fases

- **Estado:** Aceptado
- **Fecha:** 2026-11-11
- **Autor:** Javier
- **Relacionado con:** [ADR-004](./ADR-004-roles-and-access-control.md), [ADR-006](./ADR-006-simplified-roles-in-profiles.md), [ADR-007](./ADR-007-privileged-operations-edge-functions.md)

---

## Contexto

ADR-004 define el acceso a documentos por tag-matching: un usuario ve un documento si comparte al menos un tag con él. Ese modelo necesita tablas y políticas que todavía no existen (`tags`, `user_tags`, `document_tags` o su equivalente por área).

Ya existe la base para el ingreso de documentos:

| Migración | Tabla | Para qué |
|---|---|---|
| `20261111224232_area_table_creation.sql` | `areas` | Catálogo de áreas de la organización |
| `20261111225408_create_documents_table.sql` | `documents` | Metadatos del documento y su ruta en R2. Soft delete con `deleted_at` / `deleted_by` y hard delete diario con `pg_cron` a los 30 días |
| `20261111230117_create_document_area_table.sql` | `document_areas` | Relación N:N documento ↔ área |

El objetivo inmediato es lanzar a producción para que el admin empiece a subir documentos. No hace falta esperar a que el control de acceso fino esté terminado.

## Decisión

El control de acceso a documentos se implementa **por fases**. La primera fase sale a producción con este modelo:

| Operación | `documents` | `document_areas` | `areas` |
|---|---|---|---|
| `SELECT` | `authenticated` | `authenticated` | `authenticated` |
| `INSERT` | `is_admin()` | `is_admin()` | `is_admin()` |
| `UPDATE` | `is_admin()` | `is_admin()` | `is_admin()` |
| `DELETE` | `is_admin()` | `is_admin()` | `is_admin()` |

- Cualquier usuario autenticado puede leer todos los documentos.
- Solo un admin (`public.is_admin()`) puede subir, editar, hacer soft delete o borrar documentos y asignarles áreas.
- RLS sigue siendo la fuente de verdad. Las fases siguientes solo cambian las políticas de `SELECT` (y el alcance de `is_admin()`), no el código que consulta.

## Pendientes (fases siguientes)

Cada punto se resuelve en su propia migración. Si alguno cambia una decisión de este ADR, se documenta en un ADR nuevo.

1. **Lectura restringida.** Reemplazar el `SELECT` abierto de `documents` por el tag-matching de ADR-004, o por coincidencia de área (`profiles.area_id` ↔ `document_areas`). Falta decidir si las áreas sustituyen a los tags o conviven con ellos.
2. **Admin por área.** Cuando existan roles por área (ADR-006), limitar el `INSERT`/`UPDATE`/`DELETE` de un admin a los documentos de su área.
3. **Documentos borrados.** Definir si las filas con `deleted_at` no nulo se ocultan en la política de `SELECT` o en la consulta del servicio.
4. **Hard delete en R2.** El job de `pg_cron` borra la fila pero no el objeto en R2. Hay que definir cómo se borra el archivo (Edge Function, cola o job aparte).
5. **FK de `profiles.area_id`.** Ya existe `areas`; falta agregar la FK que ADR-006 dejó pendiente.
6. **Presigned URLs.** La generación de URLs de descarga debe validar el acceso consultando `documents` con el cliente de sesión, para que RLS decida (ADR-004).

## Razón

- **Lanzar antes.** El admin puede cargar el acervo de documentos mientras se construye el control de acceso fino.
- **Riesgo acotado.** Solo usuarios autenticados e invitados por un admin (ADR-007) entran al DMS, y solo los admins escriben.
- **Cambio localizado.** Pasar a la siguiente fase es reemplazar políticas RLS. Los servicios en `/lib/` no cambian.

## Consecuencias

- Mientras la fase 1 esté activa, **todo usuario autenticado ve todos los documentos**. No se deben subir documentos que solo deban ver algunas áreas hasta que el pendiente 1 esté resuelto.
- `document_areas` ya registra el área de cada documento, así que la fase de lectura restringida no requiere volver a clasificar lo que se suba ahora.
- El soft delete es un `UPDATE` sobre `deleted_at` y `deleted_by`, así que también queda restringido a `is_admin()`.
- El hard delete depende de la extensión `pg_cron` habilitada en el proyecto.
