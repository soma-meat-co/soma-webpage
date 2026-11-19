# ADR-009: Documentos de solo lectura y registro de accesos

- **Estado:** Aceptado
- **Fecha:** 2026-11-12
- **Autor:** Javier
- **Relacionado con:** [ADR-002](./ADR-002-cloudflare-r2.md), [ADR-005](./ADR-005-abstraction-layer.md), [ADR-008](./ADR-008-phased-document-access.md)

---

## Contexto

Algunos documentos deben poder verse en el DMS sin que el usuario los descargue.

Los archivos se sirven con presigned URLs de R2 que genera el servidor (`createDownloadUrl` en `src/lib/core/storage/`). Hoy esa URL se firma siempre con `Content-Disposition: attachment`, así que el navegador siempre descarga el archivo.

No existe forma de impedir del todo la descarga de un archivo que el navegador puede mostrar. Para mostrarlo, los bytes ya llegaron a la máquina del usuario, y de ahí se pueden guardar con DevTools, imprimir a PDF o capturar en pantalla. Por eso el objetivo no es impedir la descarga, sino:

1. Que la aplicación no la ofrezca ni la permita por sus propios medios cuando el documento no lo autoriza.
2. Saber quién accedió a qué documento y cuándo.

Se evaluaron estas alternativas:

| Opción | Qué hace | Por qué no ahora |
|---|---|---|
| Visor propio (PDF.js en `<canvas>`) | Quita el botón de descarga e impresión del visor nativo | Dependencia y UI nuevas; la URL sigue visible en Network |
| Marca de agua por usuario | Disuade filtraciones y permite rastrearlas | Requiere procesar el PDF en el servidor para que sobreviva a la descarga |
| Servir solo imágenes de las páginas | El archivo original nunca sale de R2 | Caro de construir y de correr para fase 1 |

Estas opciones quedan disponibles como capas adicionales si aparecen documentos más sensibles.

## Decisión

### 1. Permiso de descarga por documento

- `documents` tiene una columna `allow_download BOOLEAN NOT NULL DEFAULT false`.
- `createDownloadUrl` recibe la disposición que se pide: `inline` para ver y `attachment` para descargar.
- El servidor lee el documento con el cliente de sesión, así que RLS decide si el usuario lo ve (ADR-008, pendiente 6). Si se pide `attachment` y `allow_download` es `false`, el servidor no firma la URL y devuelve un error.
- La UI solo muestra el botón "Descargar" cuando `allow_download` es `true`. Eso es solo presentación: la regla vive en el servidor.
- Solo un admin puede cambiar `allow_download`, con la política de `UPDATE` que ya existe en `documents`.

### 2. Registro de accesos

Se crea la tabla `document_access_log`:

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `UUID` | PK |
| `document_id` | `UUID` | FK a `documents`, `ON DELETE SET NULL` para que el registro sobreviva al hard delete |
| `user_id` | `UUID` | FK a `auth.users` |
| `disposition` | `TEXT` | `inline` o `attachment` |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` |

- **Cuándo se registra:** cada vez que el servidor firma una URL de descarga, antes de devolverla.
- **Si el registro falla:** no se devuelve la URL. Se prefiere negar el acceso a dar uno sin registro.
- **RLS:**
  - `INSERT`: cualquier `authenticated`, con `WITH CHECK (user_id = auth.uid())`. Nadie puede registrar a nombre de otro.
  - `SELECT`: solo `is_admin()`.
  - Sin `UPDATE` ni `DELETE`: el registro es inmutable.

## Razón

- **Control en el servidor.** La decisión de firmar `attachment` la toma el servidor con datos que filtra RLS, nunca con lo que mande el navegador.
- **Cambio pequeño.** Es una columna, una tabla y un parámetro en el contrato de storage. No hay dependencias nuevas.
- **Trazabilidad.** Si un documento se filtra, el registro dice quién lo abrió o descargó y cuándo. Es la base de la lista `5. Audit Log`.
- **Default seguro.** Un documento nuevo es de solo lectura hasta que un admin autorice su descarga.

## Consecuencias

- **El "solo lectura" es una restricción de la aplicación, no una garantía.**
  - Con `inline`, el visor de PDF del navegador muestra su propio botón de descarga e impresión.
  - La presigned URL es visible en la pestaña Network durante 5 minutos.
  - No se deben subir al DMS documentos cuya descarga deba ser imposible.
- **Formatos que el navegador no muestra se descargan igual.** Un `.docx` o un `.xlsx` se descarga aunque se firme con `inline`. Un documento de solo lectura debería subirse en un formato visible (PDF o imagen).
- **El registro mide URLs firmadas, no aperturas reales.** Si el usuario nunca abre la URL, el acceso queda registrado igual.
- **Cambia el contrato de `StorageProvider`.** `DownloadUrlInput` agrega la disposición. Hay que actualizar `storage.provider.ts`, `storage.service.ts` y sus llamadas.
- **Al hacer hard delete se pierde el vínculo.** Los registros quedan con `document_id` en `NULL`. Si hace falta saber qué documento era, habrá que guardar una copia del nombre en el registro.
- **El registro crece con cada acceso.** Falta definir si se depura después de cierto tiempo.
