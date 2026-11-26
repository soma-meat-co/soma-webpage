# ADR-011: Folders y herencia de áreas

- **Estado:** Aceptado
- **Fecha:** 2026-11-20
- **Autor:** Javier
- **Relacionado con:** [ADR-004](./ADR-004-roles-and-access-control.md), [ADR-008](./ADR-008-phased-document-access.md)

---

## Contexto

Hasta ahora los documentos viven en una lista plana. El área de un documento se registra en `document_areas` (N:N), y ADR-008 deja pendiente usar esa relación para restringir la lectura.

Se necesita organizar los documentos en carpetas, administradas desde Supabase, y que el área asignada a una carpeta aplique a los documentos que contiene.

## Decisión

Se agregan carpetas jerárquicas en `20261120174500_create_folder_table.sql`:

| Tabla / columna | Para qué |
|---|---|
| `folders` | Árbol de carpetas. `parent_id` apunta a la carpeta padre (`NULL` = raíz). Nombre (`folder_name`) único por carpeta padre. No se puede borrar una carpeta con hijas ni con documentos (`ON DELETE RESTRICT`). |
| `folder_areas` | Relación N:N carpeta ↔ área. |
| `documents.folder_id` | Carpeta a la que pertenece el documento. Puede ser `NULL`: un documento puede vivir fuera de toda carpeta. |

### Reglas de herencia

1. **Baja por el árbol.** Un área asignada a una carpeta aplica a sus documentos directos y a los de todas sus subcarpetas, a cualquier profundidad.
2. **Es unión.** Las áreas efectivas de un documento son las suyas en `document_areas` más las heredadas de su carpeta y de todos sus ancestros. Ninguna reemplaza a otra.
3. **Documentos sin carpeta** (`folder_id` nulo) solo tienen las áreas de `document_areas`.

### Cómo se resuelve: se calcula al leer

La herencia **no se materializa** en `document_areas`. Se calcula al leer con una función `STABLE SECURITY DEFINER` (p. ej. `readable_folder_ids()`) que, con una CTE recursiva, devuelve una sola vez por consulta las carpetas cuyas áreas (propias o heredadas de ancestros) coinciden con las del usuario. La política de `SELECT` de `documents` combina las dos fuentes:

```sql
-- forma de la política, no implementación final
folder_id IN (SELECT readable_folder_ids())
OR id IN (SELECT document_id FROM document_areas WHERE area_id = <área del usuario>)
```

La búsqueda global no cambia: con RLS, `SELECT ... FROM documents WHERE name ILIKE ...` devuelve solo lo que el usuario puede leer, esté o no dentro de una carpeta.

### RLS (fase 1, igual que ADR-008)

| Operación | `folders` | `folder_areas` |
|---|---|---|
| `SELECT` | `authenticated` | `authenticated` |
| `INSERT` | `is_admin()` | `is_admin()` |
| `UPDATE` | `is_admin()` | `is_admin()` |
| `DELETE` | `is_admin()` | `is_admin()` |

### Ciclos entre carpetas

Un ciclo (A → B → A) solo puede crearse al mover una carpeta (`UPDATE` de `parent_id`); un `INSERT` no puede, porque la carpeta nueva no tiene hijas.

1. **Trigger `BEFORE UPDATE OF parent_id` en `folders`.** Recorre los ancestros del nuevo padre; si encuentra la carpeta que se mueve, lanza excepción. Vive en la base de datos para que un `UPDATE` directo no pueda saltarlo.
2. **`UNION` en la CTE recursiva de `readable_folder_ids()`.** Red de seguridad: la lectura termina aunque exista un ciclo.

3. **`pg_advisory_xact_lock` en el trigger.** Serializa los movimientos de carpetas para que dos admins moviendo carpetas entre sí al mismo tiempo no pasen ambas validaciones.

### Soft delete y carpetas

- Al hacer soft delete, el documento sale de su carpeta (`folder_id = NULL`). Así los documentos borrados no bloquean el borrado de carpetas y `ON DELETE RESTRICT` solo protege carpetas con documentos activos.
- Al recuperarlo, el documento queda sin carpeta y el admin le asigna su ruta de nuevo.
- Mientras está fuera de una carpeta, el documento pierde las áreas heredadas y solo conserva las de `document_areas`.

### RPCs de soft delete y recuperación

Eliminar y recuperar un documento solo se puede hacer con dos RPCs (`20261120185333_soft_delete_folder_null.sql`), para que cada acción sea una sola operación atómica:

| RPC | Qué hace |
|---|---|
| `soft_delete_document(p_document_id)` | Pone `deleted_at = now()`, `deleted_by = auth.uid()` y `folder_id = NULL`. |
| `restore_document(p_document_id)` | Pone `deleted_at` y `deleted_by` en `NULL`. `folder_id` se queda en `NULL`. |

- Ambos son `SECURITY DEFINER` con `search_path = ''`, validan `is_admin()` y solo `authenticated` puede ejecutarlos.
- Leen la fila con `SELECT ... FOR UPDATE` antes de modificarla, para que dos llamadas simultáneas no cambien el estado entre la validación y el `UPDATE`.
- Errores: `42501` (no es admin), `P0002` (el documento no existe), `55000` (ya eliminado al borrar, o no eliminado al recuperar).
- **Permisos por columna en `documents`.** Se quita el `UPDATE` de tabla a `authenticated` y se otorga solo sobre `name`, `description`, `folder_id`, `uploaded_at` y `updated_at`. `deleted_at` y `deleted_by` solo cambian con los RPCs. Una columna nueva que el software deba editar se agrega a ese `GRANT` en una migración nueva.

### Lectura del contenido de una carpeta

El contenido de una carpeta se lee con un solo RPC (`20261124120000_get_folder_documents_rpc.sql`), no con consultas desde el servicio. Así las reglas de lectura viven en SQL y el servicio solo traduce errores.

| Función | Qué hace |
|---|---|
| `can_access_documents()` | **Único punto** que decide quién puede leer documentos y carpetas. Fase 1: cualquier usuario con sesión. Cuando se restrinja la lectura, se cambia solo esta función. |
| `get_folder_documents(p_folder_id)` | Valida `can_access_documents()` (si no, `42501`) y regresa `{ path, folders, documents }` de la carpeta. `NULL` = raíz. |

Qué regresa `get_folder_documents`:

- **`folders` y `documents`:** hijos **directos** de la carpeta, ordenados por nombre. Excluye documentos con soft delete o con la subida pendiente.
- **`tags`** en cada carpeta y documento: nombres de sus áreas propias más las heredadas de la carpeta actual y sus ancestros (reglas de herencia de arriba), sin repetidos. Es solo para mostrar; no decide acceso.
- **`path`:** la carpeta actual y sus ancestros, de la raíz hacia abajo, para el breadcrumb. Vacío en la raíz o si la carpeta no existe; la página usa eso para responder 404.

Detalles de implementación:

- **`SECURITY INVOKER`:** además de `can_access_documents()`, aplica el RLS de cada tabla. Por eso `areas_select` se abre a `authenticated` (igual que `folders` y `document_areas`); con `is_admin()` los usuarios normales recibían `tags` vacíos.
- **Raíz y carpeta en ramas separadas.** `parent_id IS NULL` y `parent_id = p_folder_id` usan índice; `IS NOT DISTINCT FROM` no.
- **Ruta y herencia en un solo recorrido** con CTE recursiva. Como guarda la profundidad para ordenar la ruta, usa la cláusula `CYCLE` en lugar de depender de `UNION` para terminar si hubiera un ciclo.
- **Índices.** `documents_folder_id_idx` en `documents(folder_id)`. `folders.parent_id` no necesita uno propio: lo cubre el índice de `UNIQUE (parent_id, folder_name)`.

### Caché de la navegación

- La página de carpetas es un Server Component en `/DMS/documents/[[...folderId]]` que llama al provider directamente.
- El caché vive en el **navegador** (Router Cache de Next.js), no en el servidor. Un caché del servidor sería compartido entre usuarios y, cuando la lectura dependa de áreas, mostraría a un usuario lo que vio otro.
- Las acciones que escriben en carpetas invalidan con `revalidatePath('/DMS/documents', 'layout')`. Quien hace el cambio lo ve de inmediato; los demás, cuando vence `experimental.staleTimes.dynamic` en `next.config.ts` (2 min). Recargar la página siempre vuelve a consultar.

## Alternativa descartada: trigger que materializa en `document_areas`

Un trigger copiaría las áreas de la carpeta a `document_areas`. Se descarta porque, con herencia hacia subcarpetas, hay que cubrir muchos eventos: asignar o quitar un área a una carpeta, mover un documento, mover una carpeta (recalcular todo su subárbol) y crear documentos. Además, `document_areas` tendría que distinguir filas explícitas de heredadas. Serían dos fuentes de verdad que pueden desincronizarse sin error visible.

## Razón

- **Una sola fuente de verdad.** Mover documentos o carpetas no requiere mantenimiento.
- **Costo bajo.** El árbol de carpetas es pequeño (decenas o cientos de filas); la CTE recursiva se evalúa una vez por consulta gracias a la función `STABLE`.
- **Cambio localizado.** La complejidad vive en la política RLS y en una función; los servicios en `/lib/` no cambian (ADR-005, ADR-008).

## Consecuencias

- Mientras la fase 1 de ADR-008 esté activa, la herencia no cambia lo que un usuario puede ver: todo `authenticated` lee todo. `readable_folder_ids()` y la nueva política de `documents` se implementan junto con la lectura restringida (pendiente 1 de ADR-008).
- `folders_no_self_parent` cubre el ciclo de un solo nivel; el trigger de `parent_id` cubre los demás.
- Si en el futuro la política resulta lenta con muchos documentos, se puede materializar la herencia sin cambiar el modelo; eso se documentaría en un ADR nuevo.
- Al implementar la lectura restringida, `can_access_documents()` y `get_folder_documents` deben usar la misma lógica que `readable_folder_ids()`. Hoy `get_folder_documents` calcula la herencia por su cuenta solo para mostrar `tags`.
