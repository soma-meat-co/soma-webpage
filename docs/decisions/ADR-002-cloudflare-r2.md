# ADR-002: Cloudflare R2 como proveedor de object storage

- **Estado:** Aceptado
- **Fecha:** 2026-08-06
- **Autor:** Javier

---

## Contexto

Habiendo decidido usar object storage (ADR-001), se evaluaron los principales proveedores gestionados:

- **AWS S3** — referencia de la industria, ecosistema completo.
- **Cloudflare R2** — S3-compatible, sin costo de egress.
- **Backblaze B2** — almacenamiento más barato, egress gratuito solo vía Cloudflare.

También se evaluó la opción self-hosted con **MinIO**, descartada por overhead operativo innecesario para el tamaño actual del proyecto.

## Decisión

Se adopta **Cloudflare R2** como proveedor de object storage.

## Razón

- **Zero egress fees** — cada descarga de documento por un usuario no genera costo adicional. Para una biblioteca de documentos con accesos frecuentes, esto elimina la variable de costo más impredecible.
- **S3-compatible API** — cualquier SDK que funciona con AWS S3 funciona con R2 cambiando solo el endpoint. Migración futura sin reescritura de código.
- **Free tier generoso** — 10 GB de almacenamiento gratuito, suficiente para el volumen inicial del proyecto.
- **Escala al tamaño del proyecto** — no requiere configuración de infraestructura ni mantenimiento operativo.

### Comparativa de egress

| Proveedor | Egress |
|---|---|
| AWS S3 | $0.09/GB |
| Backblaze B2 | Gratis solo con Cloudflare CDN |
| Cloudflare R2 | $0.00 siempre |

## Consecuencias

- Se usa AWS SDK v3 (`@aws-sdk/client-s3`) apuntando al endpoint de R2.
- Las credenciales de R2 se manejan exclusivamente en variables de entorno server-side.
- La integración vive en `/lib/storage.ts` — el resto del sistema nunca importa el SDK directamente.
- Si en el futuro se requiere migrar a S3 o B2, solo se modifica `/lib/storage.ts` y las variables de entorno.
