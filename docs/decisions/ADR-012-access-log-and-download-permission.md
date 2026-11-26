# ADR-012: Bitácora de accesos en la base y permiso de descarga

- **Estado:** Aceptado
- **Fecha:** 2026-11-26
- **Autor:** Javier
- **Relacionado con:** [ADR-009](./ADR-009-view-only-documents-and-access-log.md) (lo modifica en parte), [ADR-008](./ADR-008-phased-document-access.md), [ADR-011](./ADR-011-folders-and-area-inheritance.md)

---

## Contexto

ADR-009 definió dos cosas: un permiso de descarga por documento (`allow_download`) y una tabla `document_access_log` que el servidor llena con un `INSERT` antes de devolver cada URL firmada.

Al implementar "Ver" y "Descargar" aparecieron tres problemas con ese diseño:

1. **Registros falsos.** Para que Next pueda insertar con la sesión del usuario, `authenticated` necesita `INSERT` sobre la tabla. `WITH CHECK (user_id = auth.uid())` impide registrar a nombre de otro, pero no impide que un usuario registre accesos que nunca hizo ni que llene la tabla desde la consola.
2. **Permiso y registro separados.** Validar el permiso, leer el documento e insertar el registro serían tres llamadas desde Next. Si algún día una action se salta el `INSERT`, hay accesos sin registro.
3. **Se pierde qué documento era.** Con `ON DELETE SET NULL`, el hard delete deja registros sin `document_id`. El mismo ADR-009 lo anotó como consecuencia.

Además, para la fase 1 se decidió que solo los admins descargan.

## Decisión

### 1. Una sola tabla, escrita solo desde la base

Se mantiene **una sola tabla** `document_access_log` para vistas y descargas (columna `access_type`). Dos tablas (`document_reads`, `document_downloads`) tendrían las mismas columnas; consultar "todo lo que hizo un usuario" requeriría un `UNION`, y un tercer tipo de acceso implicaría una tabla más.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `BIGINT IDENTITY` | PK. Ordena por inserción y ocupa menos que un UUID en una tabla que solo crece |
| `document_id` | `UUID NOT NULL` | **Sin FK**: el id sobrevive al hard delete |
| `document_name` | `TEXT NOT NULL` | Copia del nombre al momento del acceso |
| `user_id` | `UUID NOT NULL` | **Sin FK**: el historial no depende de que el usuario siga existiendo |
| `access_type` | `TEXT` | `view` o `download` (`CHECK`) |
| `accessed_at` | `TIMESTAMPTZ` | `DEFAULT now()` |

Índices: `(document_id, accessed_at DESC)` y `(user_id, accessed_at DESC)`, para "¿quién abrió este documento?" y "¿qué abrió este usuario?".

**Permisos:**
- `SELECT`: solo `is_admin()` (RLS).
- `INSERT`, `UPDATE`, `DELETE`: nadie. No hay políticas y además se revocan los privilegios a `anon` y `authenticated`. El registro es inmutable.

### 2. `access_document()`: permiso, lectura y registro en una sola llamada

`access_document(p_document_id, p_access_type)` (`SECURITY DEFINER`, `search_path = ''`):

1. `view` exige `can_access_documents()`; `download` exige `can_download_documents()`. Si no, `42501`.
2. Lee `name`, `file_path` y `file_type` del documento (sin soft delete y con la subida confirmada). Si no existe, regresa 0 filas y no registra nada.
3. Inserta en `document_access_log` con `auth.uid()`.
4. Regresa los datos para que Next firme la URL.

Todo es una transacción: si el `INSERT` falla, la llamada falla y Next no firma la URL. Se conserva la regla de ADR-009: **no hay URL sin registro**.

Es `SECURITY DEFINER` porque es la única forma de escribir en la tabla sin dar `INSERT` a `authenticated`. Por eso no aplica el RLS de `documents` y el permiso se valida dentro de la función.

### 3. Permiso de descarga: solo admin, en un solo punto

- `can_download_documents()` decide quién descarga. Fase 1: `is_admin()`.
- El `allow_download` por documento de ADR-009 **no se implementa por ahora**. Si se necesita, se agrega dentro de `can_download_documents()` (recibiendo el id del documento), sin tocar Next.
- La UI esconde "Descargar" con `isAdminRole()`. Es solo presentación: el candado es `access_document()`.

## Razón

- **Nadie puede escribir ni borrar el registro desde la API**, ni siquiera un admin. Solo hay registros de accesos que de verdad pasaron por `access_document()`.
- **No hay forma de firmar sin registrar.** El servidor no puede obtener `file_path` sin pasar por la función que registra.
- **El historial sobrevive** a renombrar o borrar documentos y usuarios.
- **Un solo lugar por permiso:** `can_access_documents()` para ver, `can_download_documents()` para descargar.

## Consecuencias

- **El registro mide URLs firmadas, no aperturas reales** (igual que ADR-009). Si falla la firma en R2 después de registrar, queda un acceso registrado sin URL entregada. Para saber si el archivo de verdad se descargó harían falta los logs de R2.
- **Cuando la lectura se restrinja por áreas** (ADR-008, ADR-011), `access_document()` debe validar que el usuario puede leer *ese* documento, con la misma lógica que `readable_folder_ids()`. Al ser `SECURITY DEFINER`, el RLS de `documents` no lo hace por ella.
- **Sin FK no hay integridad referencial.** Un `document_id` en la bitácora puede no existir en `documents`. Eso es intencional: es historial.
- **El registro crece con cada acceso.** Sigue pendiente definir retención (ADR-009).
- **"Documentos recientes"** (cookie) y la bitácora son cosas distintas: la cookie es una comodidad por navegador; la bitácora es la fuente para auditoría.
