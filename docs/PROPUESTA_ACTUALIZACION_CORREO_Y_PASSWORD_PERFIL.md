# Propuesta Técnica: Habilitar Modificación de Correo y Contraseña en Perfil con Supabase Auth

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Involucrados:** `ProfileComponent` (Frontend), `ProfileService` y `ProfileController` (Backend), `Supabase Auth Admin`  

---

## 1. Viabilidad Técnica

> **¿Es posible actualizar también el correo electrónico desde la sección "Perfil"?**  
> **Sí, es 100% posible y totalmente viable.**

---

## 2. Estado Actual vs Estado Propuesto

### A. Situación Actual en el Frontend:
- En [`profile.component.html`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/profile/profile.component.html#L18):
  El campo de correo tiene la etiqueta `Correo Electrónico (No modificable)` y el atributo `disabled`.
- En [`profile.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/profile/profile.component.ts#L29):
  El método `updateProfile()` solo envía `{ password: this.formData.password }`.

### B. Situación Actual en el Backend:
- En [`profile.service.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts#L22):
  El método `updateProfile` no acepta la propiedad `email` en su firma de TypeScript ni la persiste en la base de datos ni en Supabase.

---

## 3. Plan de Implementación Sincronizada (Correo + Contraseña)

### Paso 1: En el Backend (`ProfileService.ts`)
1. **Validaciones de Seguridad:**
   - Validar sintaxis correcta de correo (`usuario@dominio.com`).
   - Verificar que el nuevo correo no esté ocupado por otro usuario en la base de datos (`prisma.user.findUnique`).
2. **Actualización en Supabase Auth (Vía Admin API):**
   - Buscar el usuario en Supabase Auth por su correo actual.
   - Invocar:
     ```typescript
     await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
       email: nuevoCorreo,
       email_confirm: true, // Auto-confirmar para evitar bloqueo por verificación de email
       ...(data.password ? { password: data.password } : {})
     });
     ```
3. **Actualización en PostgreSQL:**
   - Actualizar `email` en la tabla `User` (y en `Client` si existe).
   - Si se envió contraseña, mantener sincronizada la clave.

### Paso 2: En el Frontend (`profile.component.html` y `.ts`)
1. Quitar el atributo `disabled` del campo de correo electrónico y cambiar la etiqueta a `Correo Electrónico`.
2. Añadir enlace bidireccional `[(ngModel)]="formData.email"`.
3. Enviar tanto `email` como `password` en la petición al backend.
4. Si el correo cambió con éxito, actualizar el estado reactivo `currentUser` en `AuthService` para que el header y el panel muestren de inmediato el nuevo correo.

---

## 4. Glosario Técnico (Nivel Junior) 📚

* **Auto-confirmación (`email_confirm: true`):** En Supabase Auth, si cambias un correo, normalmente el sistema envía un email con un enlace de confirmación antes de activar el cambio. Usando la API de administración (`email_confirm: true`), el cambio se aplica de inmediato sin que el usuario tenga que esperar ningún correo.
* **Binding Bidireccional (`[(ngModel)]`):** Técnica de Angular que conecta un campo del formulario HTML con una variable en TypeScript en tiempo real: si el usuario escribe en la pantalla, la variable cambia; si el código cambia la variable, la pantalla se actualiza.
* **Control de Unicidad (Unique Constraint):** Regla en la base de datos que prohíbe que dos cuentas distintas tengan el mismo correo electrónico.

