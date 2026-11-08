# Plan de Remediación Técnica: Corrección de Puntos Críticos (v0.3)

> **Estado**: ✅ Implementado y Verificado con Éxito (0 Errores en Frontend y Backend)  
> **Fecha**: 8 de Noviembre de 2026  
> **Proyecto**: El Rincón del Mate v0.1

---

## 1. Objetivos del Plan

Subsanar de forma definitiva los riesgos de seguridad, fugas de información y discrepancias contables identificados en `AUDITORIA_TECNICA_V0.3.md`:

1. **C-02 (Fuga de información comercial)**:
   - En `CategoryService.getBySlug`, aplicar un `select` estricto en la relación con `products` para devolver únicamente campos públicos (`id`, `name`, `slug`, `description`, `price`, `stock`, `imageUrl`, `images`, `categoryId`, `createdAt`), **excluyendo explícitamente el campo `cost`**.
2. **C-03 & N-05 (Consistencia contable en Reportes y Dashboard)**:
   - En `OrderService.updateOrderStatus`, al transicionar a `CANCELLED`, marcar el pago asociado como cancelado/anulado (`REJECTED` o `CANCELLED`).
   - En `StatsService` y `ReportService`, excluir explícitamente los pedidos con `status === 'CANCELLED'` o `status === 'PAYMENT_REJECTED'`, asegurando que solo sumen pedidos activos con pagos aprobados (`PAID`, `PACKING`, `SHIPPED`, `DELIVERED`).
3. **N-01 (Blindaje contra elevación indebida de privilegios de Administrador)**:
   - En `env.ts`, exportar `ADMIN_EMAIL` obligatoriamente o validar su presencia.
   - En `auth.service.ts`, eliminar el valor por defecto `'admin@elrincondelmate.com'`. Si `ADMIN_EMAIL` no está definido en el entorno, lanzar un error fatal en el arranque.
   - Sincronizar `syncAdminUser.ts` para usar la misma fuente de verdad.
4. **C-01 & N-03 (Eliminación de contraseña fija y manejo consistente de Supabase Auth)**:
   - En `profile.service.ts`, erradicar la contraseña por defecto `'TempPassword_2026!'`.
   - Si un usuario no existe en Supabase Auth durante la actualización de perfil, emitir un error descriptivo en lugar de crear un usuario fantasma con credenciales estáticas.
5. **N-02 (Prevención contra inyección de HTML en correos transaccionales)**:
   - Crear una función auxiliar `escapeHtml(str)` en `email.service.ts`.
   - Sanitizar todas las entradas provistas por usuarios (`client.name`, `client.phone`, `client.address`, `client.city`, `order.notes`, `item.product.name`, notas de rechazo) antes de su interpolación en el HTML de los correos.
6. **A-01 (Corrección de desactivación de productos en Zod)**:
   - En `product.validator.ts`, reemplazar `z.coerce.boolean()` por un preprocesador que interprete correctamente `"false"`, `false`, `"0"`, `"true"`, `true` y `"1"`.
7. **N-04 (Habilitación del ciclo logístico completo en el panel administrativo)**:
   - En `admin-orders.component.html` y `.ts`, permitir seleccionar y visualizar todos los estados reales del pedido (`PENDING_PAYMENT_VERIFICATION`, `PAID`, `PACKING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `PAYMENT_REJECTED`) respetando las transiciones válidas.
