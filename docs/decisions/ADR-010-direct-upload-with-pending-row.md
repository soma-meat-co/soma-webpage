# ADR-010: Subida directa a R2 con fila previa

- **Estado:** Aceptado
- **Fecha:** 2026-11-12
- **Autor:** Javier
- **Relacionado con:** [ADR-002](./ADR-002-cloudflare-r2.md), [ADR-005](./ADR-005-abstraction-layer.md), [ADR-008](./ADR-008-phased-document-access.md), [ADR-009](./ADR-009-view-only-documents-and-access-log.md)

---

## Contexto

Los documentos se suben a R2 con presigned PUT URLs que firma el servidor (`createUploadUrl` en `src/lib/core/storage/`). El navegador sube el archivo directo a R2, sin pasar por Next.

Una subida toca dos sistemas que no comparten transacción: la fila en `documents` (Supabase) y el objeto en R2. Hay que decidir cuál va primero y qué pasa si falla el segundo.

| Orden | Si falla la segunda parte |
|---|---|
| Archivo primero, fila después | Queda un archivo en R2 sin fila. No hay registro que lo encuentre |
| Fila primero, archivo después | Queda una fila sin archivo. Se puede encontrar y limpiar desde la base de datos |

## Decisión

**La fila se crea antes de subir el archivo.** El estado de la subida vive en su propia columna, `uploaded_at`, separado de la ubicación del archivo (`file_path`).

### Columnas

| Columna | Tipo | Significado |
|---|---|---|
| `file_path` | `TEXT NOT NULL` | Key del objeto en R2. Se conoce desde el insert |
| `uploaded_at` | `TIMESTAMPTZ NULL` | `NULL` mientras la subida no se confirma. Cuando se confirma, guarda el momento de la confirmación |

### Flujo

```
1. Server Action: valida admin, genera el id con crypto.randomUUID(), calcula la key
   e inserta la fila con id, file_path y metadatos (uploaded_at = NULL)
2. Server Action: firma la upload URL para esa key
3. Navegador: PUT del archivo a R2
4. Server Action de confirmación:
   UPDATE documents SET uploaded_at = now() WHERE id = $1 AND uploaded_at IS NULL
```

- **El `id` lo genera el servidor.** Así la key se calcula antes del insert y la fila nace completa en una sola escritura. El `DEFAULT gen_random_uuid()` de la tabla se queda para otros inserts. El formato de la key lo define el diseño de la key.
- **Dos escrituras son inherentes.** La fila registra dos momentos: antes del PUT ("documento reservado") y después ("archivo subido"). El PUT ocurre en el navegador, entre los dos.
- **La confirmación es idempotente.** Por la condición `uploaded_at IS NULL`, confirmar dos veces no cambia nada.
- **El insert y la confirmación usan el cliente de sesión.** RLS (`is_admin()`, ADR-008) decide si el usuario puede escribir.
- **Listados y descargas ignoran las subidas pendientes.** Las consultas del servicio filtran `uploaded_at IS NOT NULL`, igual que filtran `deleted_at`.

### Limpieza de subidas incompletas

Una subida se considera abandonada cuando `uploaded_at IS NULL` y la fila tiene más de 24 horas. Las 24 horas dan margen a subidas lentas y a reintentos.

La limpieza borra el objeto en R2 usando el `file_path` guardado, y después borra la fila. Es el mismo orden que el hard delete: nunca se borra una fila antes que su archivo. Borrar un objeto que no existe no es un error en R2, así que el caso común (el PUT nunca ocurrió) no necesita trato especial.

Como necesita credenciales de R2, la limpieza corre en una Edge Function disparada por `pg_cron`, no en SQL puro. Puede ser parte de `hard-delete-documents` o una función aparte.

## Razón

- **Ningún archivo queda invisible.** Todo objeto en R2 tiene una fila que lo referencia desde antes de existir.
- **Un dato y un estado en columnas separadas.** `file_path` dice dónde está el archivo; `uploaded_at` dice si la subida terminó. Ninguna columna hace doble trabajo, y el estado se entiende solo con leer la tabla.
- **La limpieza no depende del formato de la key.** Usa el `file_path` guardado, así que cambiar el formato de la key en el futuro no la rompe.
- **El caso en que el PUT funciona pero la confirmación falla queda cubierto.** El archivo existe y la fila sigue pendiente; la limpieza borra los dos.

## Consecuencias

- **Hay que ajustar la migración de `documents`.** `file_path` es `NOT NULL` y se agrega `uploaded_at TIMESTAMPTZ`.
- **Falta decidir dónde vive la limpieza.** Puede ser una extensión de `hard-delete-documents` o una Edge Function aparte con su propio job de `pg_cron`.
- **La confirmación confía en el cliente del admin.** El servidor no verifica que el objeto exista en R2 antes de marcar `uploaded_at`. Si hace falta, se puede verificar con un `HeadObject`, que además confirma que el tamaño coincide con `file_size`.
- **El `SELECT` abierto de la fase 1 también devuelve filas pendientes.** El filtro por `uploaded_at` vive en el servicio, no en RLS.
- **Si se confirma una subida después de las 24 horas, la limpieza pudo haber borrado ya la fila.** La confirmación no actualiza ninguna fila y el cliente debe tratarlo como error y volver a empezar la subida.
- **Subida en batch: pendiente.** Si se implementa, cada archivo sigue este mismo flujo, con su propia fila y su propia URL firmada justo antes de subirlo.
