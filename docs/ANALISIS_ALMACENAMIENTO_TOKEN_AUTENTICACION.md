# Análisis Técnico: Almacenamiento Híbrido y Gestión del Token de Autenticación

## 1. Resumen Ejecutivo
Se implementó una **estrategia de almacenamiento híbrido** para separar responsabilidades:
1. **Datos de cliente y navegación (público):** El carrito de compras permanece en `localStorage` (persistencia a largo plazo).
2. **Credenciales del dueño/administrador (sensible):** El token de autenticación fue migrado a `sessionStorage` (se destruye al cerrar la pestaña).

**Estado:** ✅ Implementado el 17/10/2026.

---

## 2. Cambios Realizados

### Archivo modificado:
- `frontend/src/app/core/services/auth.service.ts`
  - Todas las referencias a `localStorage` para `'mate_token'` y `'mate_user'` fueron reemplazadas por `sessionStorage`.

### Archivos sin cambios:
- `frontend/src/app/core/services/cart.service.ts` → El carrito sigue en `localStorage`.
- `frontend/src/app/core/interceptors/jwt.interceptor.ts` → Lee el token del `signal`, no del almacenamiento directamente.
- Backend → Sin cambios. Sigue validando el token recibido en la cabecera `Authorization: Bearer`.

---

## 3. Comportamiento Resultante

| Escenario | Resultado |
| :--- | :--- |
| El dueño inicia sesión en el panel de admin | ✅ Funciona normalmente. |
| El dueño navega entre secciones del panel | ✅ Token se mantiene activo en la pestaña. |
| El dueño cierra la pestaña o el navegador | 🔒 Sesión destruida automáticamente. |
| El dueño abre el panel en una segunda pestaña | ⚠️ Debe iniciar sesión nuevamente (aislamiento por pestaña). |
| Un cliente agrega productos al carrito y cierra el navegador | ✅ Carrito intacto al volver (permanece en `localStorage`). |

---

## 4. Arquitectura de Almacenamiento Final

```
┌─────────────────────────────────────────────────┐
│              NAVEGADOR DEL USUARIO              │
├─────────────────────┬───────────────────────────┤
│    localStorage     │     sessionStorage        │
│  (Persistente)      │  (Temporal por pestaña)   │
├─────────────────────┼───────────────────────────┤
│  'mate_cart'        │  'mate_token'             │
│  (Carrito de        │  (JWT del administrador)  │
│   compras)          │                           │
│                     │  'mate_user'              │
│                     │  (Perfil del admin)       │
└─────────────────────┴───────────────────────────┘
```
