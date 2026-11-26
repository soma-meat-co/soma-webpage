## Manejo de Sesión
La sesión se maneja desde `auth.provider` y todos los datos de sesión los maneja supabase directamente desde `src\lib\core\auth\client.ts`. 
Ya creamos el userContext que será utilizado en todo el DMS el cual maneja simplemetne un `CurrentUser`.


### After Login() to...
Después del login creamos la ruta `DMS/page.tsx` que es la landing page despues de iniciar sesión. Ahí dependiendo el rol son los permisos que el usuario tendrá. La landing page tendrá unicamente un Header con el numbre y el logo de SOMA.

## Clientes de Supabase

| Cliente | Archivo | Dónde se usa | Sesión |
|---|---|---|---|
| Navegador | `src/lib/core/auth/client.ts` | Componentes `"use client"` | Del usuario, desde cookies del navegador. Instancia única. |
| Servidor | `src/lib/core/auth/serverClient.ts` | Server Actions, Route Handlers, Server Components | Del usuario de la request, vía `cookies()`. Se crea uno por request con `createSupabaseServerClient()`. |
| Proxy | `src/lib/core/auth/proxySession.ts` | Solo `src/proxy.ts` | Del usuario, desde `request.cookies`. |

Ninguno usa la secret key. Las operaciones que la necesitan viven en Edge Functions (ver [ADR-007](./decisions/ADR-007-privileged-operations-edge-functions.md)).

## Operaciones de administración

Las funciones que solo un admin puede ejecutar viven en `src/lib/core/admin/`:

- `provider/admin.provider.ts` — contrato (`AdminProvider`) y tipos.
- `service/admin.service.ts` — implementación con Supabase. Invoca la Edge Function con el cliente de servidor y traduce sus errores a `AppError`.

### Invitar usuario

```
/DMS/admin/invite-user/page.tsx   → formulario
        ↓
invite-user/actions.ts            → inviteUserAction(): devuelve { ok, email } o { ok: false, code, message }
        ↓
adminProvider.inviteNewUser()     → functions.invoke('invite-user-as-admin')
        ↓
supabase/functions/invite-user-as-admin  → valida JWT + is_admin(), invita con service role, registra created_by
        ↓
Correo de invitación → /DMS/set-password
```

Requiere el secreto `INVITE_REDIRECT_URL` (apuntando a `/DMS/set-password`) en `supabase/functions/.env` para local y en los secretos del proyecto en producción.

## Ingreso de documentos

Tablas base (ver [ADR-008](./decisions/ADR-008-phased-document-access.md)):

| Tabla | Migración | Contenido |
|---|---|---|
| `areas` | `20261111224232_area_table_creation.sql` | Catálogo de áreas (`name` único) |
| `documents` | `20261111225408_create_documents_table.sql` | Metadatos y `file_path` en R2. Soft delete con `deleted_at` / `deleted_by` |
| `document_areas` | `20261111230117_create_document_area_table.sql` | Relación N:N documento ↔ área. Se borra en cascada con el documento o el área |

### Acceso — fase 1 (producción)

- `SELECT`: cualquier usuario `authenticated` ve todos los documentos, áreas y relaciones.
- `INSERT` / `UPDATE` / `DELETE`: solo `public.is_admin()`.

Mientras esta fase esté activa, no subir documentos que solo deban ver algunas áreas.

### Hard delete

Borrar un documento desde la app es un soft delete: se marcan `deleted_at` y `deleted_by`. Next nunca borra archivos de R2.

El borrado definitivo lo hace la Edge Function `hard-delete-documents`, que dispara un job de `pg_cron` (diario a las 2:00 UTC) con `pg_net`:

```
pg_cron → net.http_post (apikey = secret key desde Vault)
        ↓
hard-delete-documents  → busca documentos con deleted_at de más de 30 días
                       → borra el archivo en R2
                       → borra la fila (solo si el archivo se borró)
```

Configuración necesaria:

- Vault: `project_url` y `secret_key` (`select vault.create_secret('<valor>', '<nombre>');`).
- Secretos de la función: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. En local van en `supabase/functions/.env`.

## Carpetas

Decisiones y reglas de herencia en [ADR-011](./decisions/ADR-011-folders-and-area-inheritance.md).

| Tabla / función | Migración | Contenido |
|---|---|---|
| `folders`, `folder_areas`, `documents.folder_id` | `20261120174500_create_folder_table.sql` | Árbol de carpetas, áreas por carpeta, trigger contra ciclos e índice `documents_folder_id_idx` |
| `soft_delete_document`, `restore_document` | `20261120185333_soft_delete_folder_null.sql` | Únicas formas de eliminar y recuperar un documento. Al eliminar, el documento sale de su carpeta |
| `can_access_documents`, `get_folder_documents` | `20261124120000_get_folder_documents_rpc.sql` | Quién puede leer, y contenido de una carpeta con `tags` y `path` |
| `update_folder`, `update_document` | `20261126150000_update_folder_and_document_rpc.sql` | "Editar": nombre, ubicación y áreas propias en una sola transacción. Solo admin |

### Código

- `src/lib/core/folders/provider/folders.provider.ts`: contrato (`FoldersProvider`) y tipos `Folder`, `FolderDocument`, `FolderPathItem` y `FolderElements`.
- `src/lib/core/folders/service/folders.service.ts`: implementación con Supabase. CRUD de carpetas, asignar y quitar áreas, y `getFolderElements` (llama al RPC).
- `documentsProvider.moveDocumentToFolder()`: asigna, mueve o saca (`null`) un documento de una carpeta.
- `src/app/DMS/admin/folders/folders.actions.ts`: Server Actions para crear, renombrar, mover y borrar carpetas, asignar y quitar áreas, y mover documentos. Cada una llama a `revalidatePath('/DMS/documents', 'layout')` si tuvo éxito y usa `handleError`. Estar bajo `admin/` no las protege: quien bloquea a un no admin es RLS (`is_admin()`).
- Componentes en `src/components/DMS/`: `FolderRow`, `DocumentRow`, `DocumentRowSkeleton`, `FolderBreadcrumbs`, `CreateFolderButton` y `EditItemButton`. Reciben los tipos del provider tal cual.
- `src/components/DMS/DmsDialog.tsx`: diálogo de formulario reutilizable del DMS (encabezado con ícono, campos como `children`, pie con "Cancelar" y botón principal). Exporta también `DmsDialogField`, `DmsDialogNote` y la clase `DMS_DIALOG_CONTROL` para inputs y selects. Lo usan "Editar" y "Nueva carpeta".

### Navegar una carpeta

```
/DMS/documents                  → raíz
/DMS/documents/<folderId>       → carpeta
        ↓
[[...folderId]]/page.tsx        → Server Component. 404 si hay más de un segmento o el id no es UUID
        ↓                         (mientras espera, Next muestra loading.tsx)
foldersProvider.getFolderElements(folderId)
        ↓
rpc('get_folder_documents')     → can_access_documents() → { path, folders, documents }
        ↓
page.tsx                        → 404 si path llega vacío con un folderId (no existe)
                                → breadcrumb, "Regresar a <padre>", subcarpetas y documentos
```

- **Errores:** la página atrapa cualquier error con `handleError` y muestra el mensaje en lugar de la lista.
- **Caché:** vive en el navegador (Router Cache), por usuario. Las acciones que escriben en carpetas llaman a `revalidatePath('/DMS/documents', 'layout')` y `revalidatePath('/DMS')` (recientes).

### Crear y editar (solo admin)

Los botones usan `useUser()` + `isAdminRole()` y regresan `null` para quien no es admin. Es solo presentación: la base rechaza a un no admin (RLS en `folders`; `is_admin()` dentro de `update_folder` / `update_document`).

- **Nueva carpeta** (`CreateFolderButton`): junto al nombre de la carpeta actual. Crea la carpeta dentro de la que se está viendo (`parentId = folderId`, `null` en la raíz).
- **Editar** (`EditItemButton`): en cada fila de carpeta y de documento. Al abrir, `getEditOptions()` trae:
  - las carpetas destino con su ruta ("Documentos / Calidad / Auditorías"). Al editar una carpeta se quitan ella misma y sus subcarpetas, porque moverla ahí formaría un ciclo;
  - todas las áreas, y las áreas **propias** ya asignadas.
- **Guardar** llama a `updateFolder` / `updateDocument` → RPC. Las áreas van como lista completa: las que no vengan se quitan. Las heredadas de carpetas superiores no aparecen en el diálogo; se cambian editando esas carpetas.

| Código de Postgres | Mensaje |
|---|---|
| `42501` | Sin permisos |
| `P0002` | No existe (o el documento está eliminado) |
| `23505` | Ya existe una carpeta con ese nombre en el destino |
| `23514` | Mover una carpeta dentro de sí misma o de una subcarpeta |
| `23503` | La carpeta destino o un área no existen |

### Pendientes

La lista completa vive en ADR-008: lectura restringida por tags o áreas, admin por área, ocultar documentos borrados, hard delete en R2, FK de `profiles.area_id` y presigned URLs.

## Documentos recientes

"Documentos recientes" en `/DMS` muestra lo que el usuario abrió en este navegador. Se guarda en una cookie, no en la base.

| Pieza | Archivo | Qué hace |
|---|---|---|
| Cookie | `src/lib/core/documents/recentDocuments.ts` | `getRecentDocumentIds()` lee la lista y `addRecentDocument(id)` agrega un id |
| RPC | `20261126120000_get_documents_by_ids_rpc.sql` | `get_documents_by_ids(ids)`: datos actuales de esos documentos, con `tags`, en el orden de la lista |
| Provider | `documentsProvider.getDocumentsByIds(ids)` | Llama al RPC. Lista vacía = no consulta |
| Action | `openDocument(id)` en `src/app/DMS/documents/documents.actions.ts` | Abre el documento y lo registra (ver "Ver un documento") |
| Página | `src/app/DMS/page.tsx` (servidor) → `components/DMS/DmsHome.tsx` (cliente, `useUser`) → `RecentDocuments` | Lee la cookie, consulta y muestra |

```
"Ver" → openDocument(id)                         [Server Action]
        ↓
addRecentDocument(id) → cookie soma_recent_docs_<userId> = ["id3","id1",...]
        ↓
/DMS (Server Component) → getRecentDocumentIds() → getDocumentsByIds(ids)
        ↓
rpc('get_documents_by_ids') → can_access_documents() + RLS → <DmsHome> → <RecentDocuments>
```

- **Solo ids en la cookie.** Una cookie aguanta ~4 KB y viaja en cada request. El nombre o los tags pueden cambiar, y si un documento se borra o el usuario pierde acceso, RLS lo quita de la lista sin tocar la cookie.
- **Una cookie por usuario.** El nombre lleva el `userId` del JWT verificado (`getClaims`), así que dos personas en la misma computadora no ven los recientes del otro. Sin sesión, no se lee ni se escribe nada.
- **Cookie:** `httpOnly`, `sameSite: lax`, `secure` en producción, `path: /DMS`, 90 días (se renueva al abrir un documento). Máximo 8 ids. Los valores que no son UUID se ignoran, porque el usuario puede editar la cookie.
- **Caché:** escribir una cookie desde una Server Action limpia el Router Cache del usuario, así que no hace falta `revalidatePath`.
- **Solo cuenta "Ver".** "Descargar" no registra el documento como reciente.

## Ver un documento

El botón "Ver" de `DocumentRow` (`components/DMS/OpenDocumentButton.tsx`) abre el archivo en una pestaña nueva con una URL firmada de R2.

```
clic en "Ver" → abre pestaña en blanco          [cliente]
        ↓
openDocument(id)                                [Server Action]
        ↓
documentsProvider.accessDocument(id, 'view')
        ↓
rpc('access_document') → can_access_documents()? no → 42501 → AccessError (403)
                       → sí → lee el documento; sin fila → NotFound
                       → registra 'view' en document_access_log
        ↓
storageProvider.createDownloadUrl({ disposition: 'inline', fileName: withFileExtension(...) }) → URL firmada, 5 min
        ↓
addRecentDocument(id)                   → cookie de recientes
        ↓
{ ok: true, url } → la pestaña carga la URL    [cliente]
```

- **Permisos y registro antes de firmar.** La URL solo se firma después de que `access_document()` validó el permiso y registró el acceso. R2 no sabe de permisos (ver `storage.provider.ts`). Ver "Bitácora de accesos".
- **Extensión en el nombre.** `withFileExtension(name, fileType)` agrega `.pdf`, `.docx`, etc. según el MIME, si el nombre no la trae.
- **`inline` vs `attachment`.** "Ver" pide `inline` para que el navegador muestre PDFs e imágenes. Los tipos que no sabe mostrar (`.docx`, `.xlsx`, `.pptx`) se descargan igual. `attachment` (el valor por defecto) queda para "Descargar".
- **Pestaña en blanco primero.** Los navegadores bloquean `window.open` si no ocurre directo en el clic, y después de un `await` ya no cuenta como clic. Por eso se abre la pestaña antes de llamar al servidor y luego se le carga la URL. Si la action falla, la pestaña se cierra y el mensaje aparece bajo el botón. Si el navegador bloquea la pestaña, el documento se abre en la misma.
- **La URL vence a los 5 minutos.** Si el usuario recarga esa pestaña después, R2 responde 403; hay que volver a dar "Ver".

## Descargar un documento

Descargar es un permiso aparte de ver. Fase 1: solo admin. Tiene dos capas, y solo una es seguridad:

| Capa | Dónde | Qué hace |
|---|---|---|
| UI (presentación) | `components/DMS/DownloadDocumentButton.tsx` | Con `useUser()` + `isAdminRole()`, no renderiza el botón si el usuario no es admin |
| Base (el candado) | `20261126130000_can_download_documents_rpc.sql` y `20261126140000_document_access_log.sql` | `can_download_documents()` (hoy `is_admin()`). `access_document(id, 'download')` la llama y lanza `42501` si no hay permiso |

```
clic en "Descargar"  (solo visible para admin)
        ↓
downloadDocument(id)                                   [Server Action]
        ↓
documentsProvider.accessDocument(id, 'download')
        ↓
rpc('access_document') → can_download_documents()? no → 42501 → AccessError (403)
                       → sí → lee el documento; sin fila → NotFound
                       → registra 'download' en document_access_log
        ↓
storageProvider.createDownloadUrl({ disposition: 'attachment', fileName: withFileExtension(...) }) → URL firmada, 5 min
        ↓
window.location.href = url → el navegador descarga sin salir de la página
```

- **Esconder el botón no protege nada.** Una Server Action es un endpoint `POST`: cualquiera con sesión puede llamarla desde la consola. Por eso el permiso se valida en la base antes de firmar, igual que con `can_access_documents()`.
- **Un solo punto para cambiar el permiso.** Si después se abre la descarga a otros roles o áreas, se cambia solo `can_download_documents()`. La UI usa `isAdminRole()`; si el permiso cambia, hay que alinear también el botón.
- **No se abre otra pestaña.** Con `attachment` el navegador descarga en lugar de navegar, así que no hay problema con el bloqueador de pestañas.
- **No entra a "Documentos recientes".** Solo "Ver" lo agrega a la cookie. Sí queda en la bitácora.

## Bitácora de accesos

Cada "Ver" y "Descargar" queda en `document_access_log` (`20261126140000_document_access_log.sql`). Decisión completa en [ADR-012](./decisions/ADR-012-access-log-and-download-permission.md), que modifica en parte ADR-009.

- **Una sola tabla** con `access_type` (`view` o `download`), en lugar de una tabla por tipo.
- **Solo escribe `access_document()`.** Nadie tiene `INSERT`, `UPDATE` ni `DELETE` sobre la tabla, ni siquiera un admin: no se pueden falsificar ni borrar registros desde la API.
- **No hay URL sin registro.** Permiso, lectura y registro pasan en la misma transacción. Si el `INSERT` falla, la action recibe error y no firma nada.
- **Sobrevive al hard delete.** `document_id` y `user_id` no tienen FK, y se guarda una copia de `document_name`.
- **Solo admin lee** (`SELECT` con `is_admin()`). Todavía no hay pantalla para consultarla; se consulta desde Supabase:

```sql
-- ¿Quién vio o descargó este documento?
SELECT user_id, access_type, accessed_at
FROM document_access_log
WHERE document_id = '<id>'
ORDER BY accessed_at DESC;
```

- **Mide URLs firmadas, no aperturas reales.** Si el usuario nunca abre la URL, el acceso queda registrado igual.

## Errores

Todas las capas lanzan subclases de `AppError` (`src/lib/errors/base.ts`):

| Clase | Archivo | Para qué |
|---|---|---|
| `AuthError` | `errors/auth.ts` | Autenticación: no hay sesión, credenciales, links de correo, contraseñas |
| `AccessError` | `errors/access.ts` | Autorización: hay sesión pero no hay permiso, o no se pudo verificar el rol |
| `AdminError` | `errors/admin.ts` | Operaciones de administración: datos inválidos, correo duplicado o no institucional |
| `UserError` | `errors/user.ts` | Datos del perfil del usuario |
| `FolderError` | `errors/folders.ts` | Carpetas: crear, renombrar, mover, borrar, leer, asignar y quitar áreas |

Cada `AppError` tiene `code` (estable, para la UI), `detail` (técnico, solo para logs), `genericMessage` (para mostrar al usuario) y `statusCode`.

Las clases de error no sobreviven el paso del servidor al cliente. Las Server Actions atrapan los `AppError` y devuelven `{ ok: false, code, message }` con el `genericMessage`.

### `handleError`

`handleError(context, err)` (`src/lib/errors/handleError.ts`) va en el `catch` de quien maneja el error (Server Actions y páginas):

- Registra el error con el formato `[context] code (status): detail`: los 4xx con `console.warn` y los 5xx con `console.error`. Un error que no es `AppError` se registra completo con `console.error`.
- Regresa `{ code, message }` listo para mostrar. Si el error no es `AppError`, el código es `UNEXPECTED_ERROR` y el mensaje es genérico.

El registro no está en el constructor de `AppError` a propósito: crear un error no significa que nadie lo manejó, y solo el `catch` conoce el contexto.

```ts
} catch (err) {
    return { ok: false, ...handleError('confirmUploadedDocument', err) };
}
```

