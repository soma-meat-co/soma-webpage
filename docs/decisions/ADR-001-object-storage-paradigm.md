# ADR-001: Object Storage como paradigma de almacenamiento

- **Estado:** Aceptado
- **Fecha:** 2026-08-06
- **Autor:** Javier

---

## Contexto

El sistema de biblioteca de documentos requiere almacenar y servir archivos (PDFs, documentos) a usuarios autenticados con permisos diferenciados. Se evaluaron tres paradigmas de almacenamiento:

- **Block storage** — almacenamiento a nivel de bloques de bytes, montado en un servidor específico.
- **File storage** — sistema de archivos compartido accesible desde la red vía NFS/SMB.
- **Object storage** — almacenamiento vía API HTTP, cada archivo tiene su propia URL.

## Decisión

Se adopta **object storage** como paradigma de almacenamiento para todos los documentos del sistema.

## Razón

| Criterio | Block | File | Object |
|---|---|---|---|
| Compatible con serverless (Next.js/Vercel) | ✗ | Parcial | ✓ |
| Acceso via HTTP nativo | ✗ | ✗ | ✓ |
| Presigned URLs para acceso temporal seguro | ✗ | ✗ | ✓ |
| Escala automática | ✗ | Limitada | ✓ |
| Pay-as-you-go | ✗ | ✗ | ✓ |

**Block storage** fue descartado porque está atado a una instancia de servidor — incompatible con el modelo serverless de Next.js y sin soporte nativo de presigned URLs.

**File storage** fue descartado porque, aunque resuelve el acceso simultáneo, sigue sin tener URL nativa ni presigned URLs — los dos mecanismos críticos para servir documentos internos de forma segura.

**Object storage** es el único paradigma donde el flujo de acceso seguro funciona nativamente:

```
Usuario solicita documento
→ Servidor valida permisos (RLS)
→ Servidor genera presigned URL con expiración corta
→ Usuario descarga directo desde el storage
→ URL expira — no es compartible
```

## Consecuencias

- Todo acceso a documentos pasa por presigned URLs generadas server-side.
- Ningún archivo tiene URL pública permanente.
- La capa de autenticación valida permisos antes de firmar cualquier URL.
- El cliente nunca recibe credenciales de storage — solo URLs temporales.
