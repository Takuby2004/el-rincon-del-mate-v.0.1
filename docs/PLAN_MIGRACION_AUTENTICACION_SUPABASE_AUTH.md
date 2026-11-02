# 🛡️ Plan de Migración: Autenticación con Supabase Auth v0.1

**Fecha:** Noviembre 2026  
**Proyecto:** El Rincón del Mate (Backend & Frontend)  
**Módulos Afectados:** Autenticación (`AuthService`, `AuthController`, `auth.middleware.ts`, `schema.prisma`)  
**Estado:** ✅ Implementado y Validado con Éxito (0 Errores)  

---

## 1. 🎯 Diagnóstico y Justificación de Seguridad

Actualmente, el sistema gestiona las credenciales de forma personalizada en la tabla `User` de PostgreSQL:
1. Almacena contraseñas encriptadas con `bcrypt` en la columna `User.password`.
2. El backend firma y valida tokens JWT manualmente con una clave secreta local (`JWT_SECRET`).

### ¿Por qué migrar a Supabase Auth?
* **Gestión Centralizada y Aislada:** Las contraseñas se almacenan en el esquema seguro de Supabase (`auth.users`), inaccesible directamente por consultas SQL públicas o volcados accidentales.
* **Protección contra Ataques:** Supabase Auth incluye protección nativa contra ataques de fuerza bruta (*Brute-force protection*), detección de credenciales comprometidas y limitación de intentos.
* **Escalabilidad Futura:** Facilita la activación inmediata de autenticación en dos pasos (2FA/MFA), recuperación segura de contraseña por correo electrónico y proveedores OAuth (Google, Apple, etc.).

---

## 2. 🏗️ Arquitectura Propuesta: Enfoque Híbrido Seguro

Para mantener la estabilidad del sistema y minimizar el riesgo de fallos en producción, se propone la siguiente arquitectura:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend (Angular)                                           │
│    • El formulario de login envía { email, password }          │
│    • Al recibir el token de Supabase, lo guarda en sessionStorage│
│    • El jwtInterceptor lo adjunta en cabecera: Authorization    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ POST /api/auth/login
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Backend API (Express en Render)                              │
│    • AuthService delega la validación a Supabase Auth:          │
│      supabase.auth.signInWithPassword({ email, password })      │
│    • Supabase valida la clave y emite un JWT firmado oficial    │
│    • El backend consulta el rol del usuario (ADMIN/CLIENT)      │
│    • Devuelve { user, token } idéntico a lo que espera Angular  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Middleware de Protección (authenticateToken)                 │
│    • Valida el JWT recibido usando el cliente oficial Supabase: │
│      supabase.auth.getUser(token)                               │
│    • Si el token es legítimo y vigente, permite el acceso       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 📋 Fases del Plan de Implementación

### Fase 1: Creación del Usuario en Supabase Auth
* Registrar al Administrador (`admin@elrincondelmate.com`) en la sección **Authentication > Users** de Supabase Dashboard con una contraseña segura.

### Fase 2: Configuración del Cliente Supabase en Backend
* Inicializar el cliente `@supabase/supabase-js` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

### Fase 3: Actualización de `AuthService.login` y `AuthService.register`
* Reemplazar la comparación manual `bcrypt.compare` por `supabase.auth.signInWithPassword`.
* En el registro de nuevos clientes, delegar la creación a `supabase.auth.admin.createUser` o `signUp`.

### Fase 4: Refactorización de `authenticateToken`
* Verificar los tokens entrantes utilizando la validación criptográfica de Supabase (`supabase.auth.getUser(token)`).

### Fase 5: Limpieza de Esquema de Base de Datos
* Eliminar o volver opcional la columna `password` en el modelo `User` de `schema.prisma`, garantizando que ninguna contraseña viva en la base de datos de la tienda.

---

## 4. 📖 Glosario de Conceptos para Desarrolladores Juniors

* **Supabase Auth (`auth.users`):** Es una bóveda de seguridad especializada y aislada que viene preconstruida en Supabase. Se encarga exclusivamente de verificar correos, contraseñas y sesiones, sin mezclar las contraseñas con los datos del catálogo o los pedidos de la tienda.
* **Brute-force Protection (Protección de Fuerza Bruta):** Mecanismo de defensa que detecta si un robot intenta adivinar una contraseña probando miles de combinaciones por minuto, bloqueando la cuenta o la dirección IP atacante automáticamente.
* **MFA / 2FA (Autenticación Multifactor):** Capa extra de seguridad donde, además de la contraseña, se solicita un código temporal de 6 dígitos (desde una app como Google Authenticator o por SMS) para ingresar al panel de administración.
* **Delegated Auth (Autenticación Delegada):** Es cuando tu backend no se preocupa por saber si la contraseña es correcta; simplemente le pregunta a un especialista externo (Supabase): *"Oye, ¿este usuario y clave son válidos?"*. Si Supabase dice que sí, el backend le da la bienvenida al usuario.

