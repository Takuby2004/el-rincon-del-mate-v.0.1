# Auditoría Técnica: Actualización de Contraseña en el Perfil y Sincronización con Supabase Auth

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulos Evaluados:** [`ProfileService`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts), [`AuthService`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/auth.service.ts), [`profile.component.ts`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/frontend/src/app/features/profile/profile.component.ts)  

---

## 1. Respuesta a la Pregunta del Usuario

> **¿Al actualizar la contraseña desde el panel de control en la sección "Perfil", también se actualiza la contraseña en Supabase?**  
> **NO, actualmente NO se actualiza en Supabase.**

---

## 2. Diagnóstico del Código y Causa Raíz

### A. Lo que hace actualmente la sección "Perfil"
Al revisar [`ProfileService.updateProfile`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts#L22):
```typescript
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, name: true, phone: true, role: true, clientProfile: true }
    });
```
1. El backend recibe la nueva contraseña.
2. La encripta con `bcrypt.hash(...)` y la guarda en la tabla `User` de la base de datos PostgreSQL.
3. **No se comunica en ningún momento con Supabase Auth**.

### B. El problema que esto provoca (Desincronización Crítica)
1. En [`AuthService.login`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/auth.service.ts#L73), el inicio de sesión se valida **estrictamente contra la bóveda de Supabase**:
   ```typescript
   const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
     email: data.email,
     password: data.password
   });
   ```
2. Si cambias la contraseña en el panel de control:
   - La nueva contraseña queda guardada en PostgreSQL.
   - Pero en Supabase Auth sigue registrada la contraseña antigua.
3. La próxima vez que intentes iniciar sesión:
   - Si introduces la nueva contraseña: **Supabase la rechazará** diciendo *"Credenciales inválidas"*.
   - Solo podrás entrar con la contraseña vieja que Supabase sigue teniendo guardada.

---

## 3. Plan de Solución Propuesto

Para que el cambio de contraseña sea 100% efectivo:

1. **Sincronizar con Supabase Admin API:**
   En [`ProfileService.updateProfile`](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/services/profile.service.ts):
   - Obtener el usuario actual por su `userId` para conocer su correo electrónico.
   - Si se envía `data.password`:
     - Localizar al usuario en Supabase Auth mediante su correo usando `supabaseAdmin.auth.admin.listUsers()`.
     - Actualizar la contraseña directamente en la bóveda de Supabase Auth usando:
       ```typescript
       await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
         password: data.password
       });
       ```
2. **Actualizar el registro en PostgreSQL:**
   - Mantener la contraseña sincronizada o marcada como administrada por Supabase (`SUPABASE_AUTH_MANAGED`).

---

## 4. Glosario Técnico (Nivel Junior) 📚

* **Bóveda de Identidad (Auth Vault):** Es el servidor seguro de Supabase donde se guardan las contraseñas reales de los usuarios con encriptación de grado militar. Nadie (ni siquiera los desarrolladores) puede ver la contraseña en texto plano.
* **Desincronización de Datos (Data Desync):** Cuando dos lugares que deberían tener la misma información (tu base de datos PostgreSQL y Supabase Auth) tienen datos diferentes. En este caso, la base de datos tenía la contraseña nueva pero Supabase seguía teniendo la vieja.
* **Supabase Admin Auth API (`auth.admin`):** Funciones especiales de Supabase que solo puede ejecutar el backend usando la `service_role key`. Permiten cambiar contraseñas, borrar usuarios o confirmar correos sin que el usuario tenga que hacerlo por email.
* **Hash / Bcrypt:** Algoritmo matemático que convierte una contraseña (como `Mate2026!`) en una cadena ininteligible de caracteres (`$2a$10$e7...`). Sirve para que si alguien hackea la base de datos, no pueda leer las contraseñas de las personas.

