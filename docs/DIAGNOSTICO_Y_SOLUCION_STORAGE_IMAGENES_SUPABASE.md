# Diagnóstico Técnico: Almacenamiento de Imágenes y Error en Supabase Storage

**Fecha:** 2 de Noviembre de 2026  
**Proyecto:** El Rincón del Mate (v.0.1)  
**Módulo:** Carga y Persistencia de Imágenes de Productos y Categorías  

---

## 1. Respuestas Directas a las Preguntas

### ¿Está funcionando bien el almacenamiento de imágenes en Supabase?
**No, actualmente está fallando.**  
Al intentar guardar un producto con imágenes nuevas, el servidor de Supabase Storage rechaza la petición con un error HTTP **403 Forbidden**:
```json
{
  "statusCode": "403",
  "error": "Unauthorized",
  "message": "Invalid Compact JWS",
  "code": "AccessDenied"
}
```

### ¿O el backend todavía almacena esas imágenes personalmente (en su propio disco)?
**No las está almacenando en el disco local en este momento.**  
El backend cuenta con un sistema de respaldo (*fallback*) para guardar archivos localmente en la carpeta `backend/uploads/products/`. Sin embargo, debido a que el entorno está en modo producción (`NODE_ENV="production"`):
- El almacenamiento en disco local está intencionalmente **bloqueado**, ya que en servidores en la nube como Render el disco es **efímero** (se borra en cada reinicio o nuevo despliegue).
- Por esa razón, al fallar Supabase, la subida se corta de inmediato y **la imagen no se guarda en ningún lado**, mostrando el error rojo en la pantalla del administrador.

---

## 2. Causa Raíz del Error: "Invalid Compact JWS"

El error se origina en [fileStorageService.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/utils/fileStorageService.ts) y en la configuración de claves en [.env](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/.env):

1. **Incompatibilidad de Formato de Clave (JWS / JWT):**
   - El backend realiza una llamada HTTP manual (`fetch`) al endpoint de Storage:
     `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${objectPath}`
     enviando el encabezado:
     `Authorization: Bearer ${supabaseKey}`.
   - La clave configurada en [.env](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/.env) es la nueva clave pública publishable de Supabase:
     `sb_publishable_G6c3Jhy7DL4YBnCIsGWvzw_UMqOWpC7`.
   - **El problema:** Las claves que inician con `sb_publishable_...` **no son tokens JWT**. El servidor de Supabase Storage (Kong Gateway) espera en la cabecera `Authorization: Bearer` un token JWT firmado de tres partes (`header.payload.signature`, que inicia típicamente con `eyJ...`). Al no reconocer esa estructura, arroja `"Invalid Compact JWS"` (*Firma Web JSON compacta no válida*).

2. **Falta de la Clave Secreta de Administrador (`service_role`):**
   - Para que el backend pueda escribir libremente en los buckets de Storage de Supabase saltándose las políticas restrictivas de usuarios anónimos, debe usar la clave `SUPABASE_SERVICE_ROLE_KEY` (la clave secreta JWT que se encuentra en el panel de Supabase: *Project Settings -> API -> Project API keys -> service_role secret*).
   - En el archivo local [.env](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/.env) dicha clave no está definida.

3. **Uso de `fetch` manual en vez del SDK oficial `@supabase/supabase-js`:**
   - En [supabase.ts](file:///c:/Users/leona/Coding/Google%20AI%20Studio%20Proyects/el-rincon-del-mate-v.0.1/backend/src/config/supabase.ts) ya existe el cliente administrativo `supabaseAdmin`.
   - Si se utiliza el SDK oficial (`supabaseAdmin.storage.from(bucket).upload(...)`), Supabase gestiona de forma automática los encabezados (`apikey`, `Authorization`, tipo de contenido binario) evitando errores de sintaxis en llamadas HTTP crudas.

---

## 3. Plan de Solución Propuesto

1. **Obtener la Clave `service_role` de Supabase:**
   - Ir al panel de Supabase: `Project Settings` > `API Keys`.
   - Copiar la clave **`service_role`** (inicia con `eyJ...`).
   - Agregar en `backend/.env` y en las variables de entorno de Render:
     ```env
     SUPABASE_URL="https://gleylrngndyvxaucxfrf.supabase.co"
     SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     SUPABASE_STORAGE_BUCKET="el-rincon-del-mate"
     ```

2. **Verificar que el Bucket Exista en Supabase:**
   - En el panel de Supabase ir a **Storage**.
   - Confirmar que exista el bucket llamado `el-rincon-del-mate` y que esté marcado como **Público** (Public Bucket) para que las fotos puedan verse en la tienda sin necesidad de URLs firmadas temporales.

3. **Refactorizar `FileStorageService.ts` para usar el cliente oficial `supabaseAdmin`:**
   - Reemplazar la petición `fetch` manual por `supabaseAdmin.storage.from(supabaseBucket).upload(...)`.

---

## 4. Glosario Técnico (Nivel Junior) 📚

1. **JWS / JWT (JSON Web Signature / JSON Web Token):**
   - Es una credencial digital en forma de cadena de texto dividida en tres partes por puntos (`parte1.parte2.parte3`). Es como un pasaporte digital firmado criptográficamente.
2. **Invalid Compact JWS:**
   - Significa: *"El pasaporte o credencial que me mostraste no tiene la estructura ni el formato estándar que necesito para validarte"*.
3. **Service Role Key:**
   - Es la "llave maestra" de tu backend. A diferencia de la clave pública (que solo tiene permisos limitados para clientes web), la clave de servicio le da a tu servidor permisos totales para guardar archivos, crear registros y administrar la base de datos sin restricciones de seguridad RLS.
4. **Bucket de Almacenamiento:**
   - Es el equivalente a una "carpeta en la nube" (como en Google Drive o AWS S3) donde se guardan archivos multimedia como fotos, audios o videos.
5. **Almacenamiento Efímero:**
   - Tipo de almacenamiento que "desaparece". Plataformas de hosting como Render o Heroku destruyen y recrean los contenedores en cada despliegue, por lo que cualquier foto guardada en el disco del servidor se borra automáticamente. Por eso es obligatorio usar un servicio externo como Supabase Storage.
6. **Fallback (Plan de Respaldo):**
   - Un mecanismo alternativo que se activa cuando el camino principal falla. Por ejemplo: si la nube no responde, guardar temporalmente en el disco de la computadora mientras estás programando localmente.

